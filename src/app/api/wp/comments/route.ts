export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createHmac } from 'crypto'

import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

import { verifySession } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })

  // === DEBUG: Environment Variables ===

  const incoming = new URL(req.url)
  
  // Check for force Basic Auth override
  const forceBasicAuth = incoming.searchParams.get('auth') === 'basic'
  const id = incoming.searchParams.get('id')
  
  // If the user has a WP token in session, forward it so authorized statuses (e.g., hold/spam) can be fetched for admins
  let wpToken: string | undefined
  if (!forceBasicAuth) {
    try {
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
      if (sessionCookie?.value) {
        const claims = await verifySession(sessionCookie.value) as { wpToken?: string }
        wpToken = claims?.wpToken
      } else {
        // No session cookie found
      }
    } catch {
      // Session verification failed - proceed without Authorization
    }
  } else {
    // Skipping session token extraction due to forceBasicAuth
  }
  
  // Build query with sensible defaults
  const search = new URLSearchParams(incoming.search)
  if (!search.has('per_page')) search.set('per_page', '20')
  if (!search.has('orderby')) search.set('orderby', 'date')
  if (!search.has('order')) search.set('order', 'desc')

  // For admin requests, include all comment statuses if not specifically filtered
  const isAdminRequest = req.headers.get('referer')?.includes('/admin/')
  if (isAdminRequest && !search.has('status')) {
    // Include all statuses for admin interface
    search.set('status', 'all')
  }

  // Normalize status filter values to WordPress REST conventions
  if (search.has('status')) {
    const status = (search.get('status') || '').toLowerCase()
    // WP REST accepts 'approve', 'hold', 'spam', 'trash' for filtering
    const map: Record<string, string> = {
      approved: 'approve',
      unapproved: 'hold',
      pending: 'hold',
      hold: 'hold',  // Preserve 'hold' as-is
      spam: 'spam',
      trash: 'trash',
      all: 'all',
    }
    const normalized = map[status]
    if (normalized) {
      search.set('status', normalized)
    } else {
      // Unknown value: drop to avoid upstream 400s
      search.delete('status')
    }
  }

  // Process author parameter for WordPress REST API
  const authorParam = search.get('author')
  
  // WordPress REST API expects 'author' as array parameter for proper filtering
  if (authorParam && !search.has('author[]')) {
    search.delete('author')
    search.append('author[]', authorParam)
  }

  // Try MU proxy first when available (re-enabled for debugging) - skip if forcing Basic Auth
  const secret = process.env.FE_PROXY_SECRET || ''
  const path = 'wp/v2/comments'
  if (secret && !forceBasicAuth) {
    // Using MU proxy
    const proxy = new URL('/wp-json/fe-auth/v1/proxy', WP)
    proxy.searchParams.set('path', path)
    search.forEach((v, k) => {
      // Skip internal Next.js API parameters
      if (k !== 'auth') {
        proxy.searchParams.set(`query[${k}]`, v)
      }
    })
    const ts = String(Math.floor(Date.now() / 1000))
    const base = `GET\n${path}\n${ts}\n`
    const sign = createHmac('sha256', secret).update(base).digest('base64')
    const proxyHeaders: Record<string, string> = { 'x-fe-ts': ts, 'x-fe-sign': sign }
    if (wpToken) proxyHeaders['Authorization'] = `Bearer ${wpToken}`
    const res = await fetch(proxy.toString(), { headers: proxyHeaders, cache: 'no-store' })
    if (res.ok) {
      const text = await res.text()
      // Parse and process the response
      try {
        JSON.parse(text) // Validate JSON structure
      } catch {
        // Invalid JSON response
      }
      // Forward pagination headers when present
      const headers: Record<string, string> = {
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'public, max-age=60',
        'X-Upstream': 'proxy',
        'X-Upstream-Url': proxy.toString(),
      }
      const total = res.headers.get('X-WP-Total')
      const totalPages = res.headers.get('X-WP-TotalPages')
      if (total) headers['X-WP-Total'] = total
      if (totalPages) headers['X-WP-TotalPages'] = totalPages
      return new Response(text, { status: 200, headers })
    } else {
      // Proxy request failed
    }
  } else if (forceBasicAuth) {
    // Skipping MU proxy due to force Basic Auth request
  } else {
    // Skipping MU proxy - no secret configured
  }

  const out = id ? new URL(`/wp-json/wp/v2/comments/${id}`, WP) : new URL('/wp-json/wp/v2/comments', WP)
  if (!id) {
    // Filter out internal parameters before sending to WordPress
    search.forEach((v, k) => {
      // Skip internal Next.js API parameters
      if (k !== 'auth') {
        out.searchParams.set(k, v)
      }
    })
  }

  // Prefer session-derived token; fall back to any inbound Authorization header if present
  const bearer = wpToken ? `Bearer ${wpToken}` : (req.headers.get('authorization') || '')
  const tryHeaders = (auth?: string): HeadersInit | undefined => auth ? { Authorization: auth } : undefined

  // Helper to build response with pagination headers
  const forward = async (res: Response, upstreamUrl: string) => {
    const text = await res.text()
    try {
      JSON.parse(text) // Validate JSON structure
    } catch {
      // Invalid JSON response
    }
    const headers: Record<string, string> = {
      'Content-Type': res.headers.get('Content-Type') || 'application/json',
      'Cache-Control': 'public, max-age=60',
      'X-Upstream-Url': upstreamUrl,
    }
    const total = res.headers.get('X-WP-Total')
    const totalPages = res.headers.get('X-WP-TotalPages')
    if (total) headers['X-WP-Total'] = total
    if (totalPages) headers['X-WP-TotalPages'] = totalPages
    return new Response(text, { status: 200, headers })
  }

  // 1) Try bearer/session auth if available (skip if forcing Basic Auth)
  let res: Response | undefined
  if (!forceBasicAuth) {
    res = await fetch(out.toString(), { cache: 'no-store', headers: tryHeaders(bearer) })
    if (res.ok) {
      return forward(res, out.toString())
    }
  } else {
    // Skipping bearer auth due to force Basic Auth request
  }

  // 2) Try Basic Auth (Application Password) if configured
  const basicUser = process.env.WP_USER || process.env.WP_API_USER
  const basicPass = process.env.WP_APP_PASSWORD || process.env.WP_API_APP_PASSWORD
  if (basicUser && basicPass) {
    const token = Buffer.from(`${basicUser}:${basicPass}`).toString('base64')
    const basicAuthHeader = `Basic ${token}`
    
    res = await fetch(out.toString(), { 
      cache: 'no-store', 
      headers: { Authorization: basicAuthHeader } 
    })
    
    if (res.ok) {
      return forward(res, out.toString())
    } else {
      await res.text() // Consume response
      // Re-fetch for the fallback logic since we consumed the response
      res = await fetch(out.toString(), { 
        cache: 'no-store', 
        headers: { Authorization: basicAuthHeader } 
      })
    }
  } else {
    // Basic Auth skipped - missing credentials
  }

  // If no res yet, make an unauthenticated request for the final error handling
  if (!res) {
    res = await fetch(out.toString(), { cache: 'no-store' })
  }

  // 3) Handle expected upstream errors gracefully
  if ([400, 404].includes(res.status)) {
    return Response.json([], { status: 200, headers: { 'Cache-Control': 'public, max-age=30', 'X-Upstream-Status': String(res.status), 'X-Upstream-Url': out.toString() } })
  }
  return new Response('Upstream error', { status: res.status })
}

// Create a comment (requires authenticated user)
export async function POST(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })

  // Require authenticated session
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  if (!sessionCookie?.value) return new Response('Unauthorized', { status: 401 })
  let claims: { wpToken?: string }
  try { claims = await verifySession(sessionCookie.value) as { wpToken?: string } } catch { return new Response('Unauthorized', { status: 401 }) }
  const wpToken = claims.wpToken
  if (!wpToken) return new Response('Missing upstream token', { status: 401 })

  // Parse and validate body
  let body: unknown = {}
  try {
    body = await req.json()
  } catch {
    body = {}
  }
  const content = ((body as Record<string, unknown>)?.content ?? '').toString().trim()
  const postId = Number((body as Record<string, unknown>)?.postId)
  const parent = (body as Record<string, unknown>)?.parent ? Number((body as Record<string, unknown>).parent) : undefined
  if (!content || !postId) {
    return Response.json({ error: 'content and postId are required' }, { status: 400 })
  }

  try {
    const upstreamUrl = new URL('/wp-json/wp/v2/comments', WP)
    const wpRes = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${wpToken}` },
      body: JSON.stringify({ content, post: postId, parent }),
      cache: 'no-store',
    } as RequestInit)

    const raw = await wpRes.text()

    // Attempt to parse for consistent error wrapping
    let parsed: unknown = null
    try { parsed = JSON.parse(raw) } catch { /* non-JSON upstream response */ }

    if (!wpRes.ok) {
      // Surface upstream error details while avoiding leaking sensitive tokens
      const payload = typeof parsed === 'object' && parsed !== null ? parsed : { error: raw.slice(0, 500) }
      return Response.json({
        ok: false,
        upstreamStatus: wpRes.status,
        upstream: payload,
      }, { status: wpRes.status })
    }

    // Success – return upstream as-is (parsed if possible for faster client usage)
    if (parsed) {
      return Response.json(parsed, { status: wpRes.status, headers: { 'X-Upstream-Url': upstreamUrl.toString() } })
    }
    return new Response(raw, { status: wpRes.status, headers: { 'Content-Type': wpRes.headers.get('Content-Type') || 'application/json', 'X-Upstream-Url': upstreamUrl.toString() } })
  } catch (e: unknown) {
    // Network / unexpected failure
    return Response.json({ error: 'upstream_request_failed', message: e instanceof Error ? e.message : 'Unknown error' }, { status: 502 })
  }
}
