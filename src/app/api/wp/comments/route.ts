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
  console.log('=== COMMENTS API DEBUG START ===')
  console.log('WP_USER value:', JSON.stringify(process.env.WP_USER))
  console.log('WP_USER split test:', process.env.WP_USER?.split(' '))
  console.log('WP_APP_PASSWORD length:', process.env.WP_APP_PASSWORD?.length || 0)
  console.log('WP_USER exists:', !!process.env.WP_USER)
  console.log('WP_APP_PASSWORD exists:', !!process.env.WP_APP_PASSWORD)

  const incoming = new URL(req.url)
  console.log('Request URL:', incoming.toString())
  
  // Check for force Basic Auth override
  const forceBasicAuth = incoming.searchParams.get('auth') === 'basic'
  console.log('Force Basic Auth requested:', forceBasicAuth)
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
        console.log('Session wpToken found:', !!wpToken)
      } else {
        console.log('No session cookie found')
      }
    } catch (e) {
      console.log('Session verification failed:', e instanceof Error ? e.message : 'Unknown error')
      // no session / not authenticated; proceed without Authorization
    }
  } else {
    console.log('Skipping session token extraction due to forceBasicAuth')
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

  // Debug: Log the post parameter
  const postParam = search.get('post')
  const authorParam = search.get('author')
  console.log('Comments API: post parameter received:', postParam)
  console.log('Comments API: author parameter received:', authorParam)
  console.log('Comments API: admin request detected:', isAdminRequest)
  console.log('Comments API: full search params:', search.toString())
  
  // For WordPress REST API comments endpoint:
  // - 'post' parameter should remain singular for filtering by specific post ID
  // - 'author' parameter can be converted to array format for multiple authors
  // Only convert post to array if we explicitly need multiple post filtering
  
  // WordPress REST API expects 'author' as array parameter for proper filtering, so convert single values
  if (authorParam && !search.has('author[]')) {
    search.delete('author')
    search.append('author[]', authorParam)
    console.log('Comments API: Converted author param to array format')
  }

  // Try MU proxy first when available (re-enabled for debugging) - skip if forcing Basic Auth
  const secret = process.env.FE_PROXY_SECRET || ''
  const path = 'wp/v2/comments'
  if (secret && !forceBasicAuth) {
    console.log('=== TRYING MU PROXY ===')
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
    console.log('Comments API: Using proxy with URL:', proxy.toString())
    const proxyHeaders: Record<string, string> = { 'x-fe-ts': ts, 'x-fe-sign': sign }
    if (wpToken) proxyHeaders['Authorization'] = `Bearer ${wpToken}`
    const res = await fetch(proxy.toString(), { headers: proxyHeaders, cache: 'no-store' })
    if (res.ok) {
      const text = await res.text()
      console.log('Comments API: Proxy response length:', text.length)
      // Parse and debug the response
      try {
        const data = JSON.parse(text)
        if (Array.isArray(data)) {
          console.log('Comments API: Proxy returned', data.length, 'comments')
          console.log('Comments API: Post IDs in proxy response:', data.map(c => c.post).slice(0, 5))
        }
      } catch {
        console.log('Comments API: Failed to parse proxy response for debugging')
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
      console.log('Comments API: Proxy failed with status:', res.status, res.statusText)
    }
  } else if (forceBasicAuth) {
    console.log('=== SKIPPING MU PROXY (force Basic Auth requested) ===')
  } else {
    console.log('=== SKIPPING MU PROXY (no secret) ===')
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
  console.log('Comments API: Final WordPress URL:', out.toString())

  // Prefer session-derived token; fall back to any inbound Authorization header if present
  const bearer = wpToken ? `Bearer ${wpToken}` : (req.headers.get('authorization') || '')
  const tryHeaders = (auth?: string): HeadersInit | undefined => auth ? { Authorization: auth } : undefined

  // Helper to build response with pagination headers
  const forward = async (res: Response, upstreamUrl: string) => {
    const text = await res.text()
    console.log('=== FORWARD RESPONSE DEBUG ===')
    console.log('WordPress response length:', text.length)
    console.log('WordPress response status:', res.status)
    try {
      const data = JSON.parse(text)
      if (Array.isArray(data)) {
        console.log('Number of comments received:', data.length)
        console.log('Comment statuses:', [...new Set(data.map(c => c.status))])
        console.log('Post IDs in comments:', [...new Set(data.map(c => c.post))].slice(0, 5))
        // Show sample comments with status for debugging
        console.log('Sample comments with status:', data.slice(0, 3).map(c => ({
          id: c.id,
          status: c.status,
          post: c.post,
          content: c.content?.rendered?.substring(0, 50) + '...'
        })))
      } else {
        console.log('Response is not an array:', typeof data)
      }
    } catch {
      console.log('Failed to parse response for debugging, first 200 chars:', text.substring(0, 200))
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
    console.log('Response headers being sent:', headers)
    return new Response(text, { status: 200, headers })
  }

  // 1) Try bearer/session auth if available (skip if forcing Basic Auth)
  let res: Response | undefined
  if (!forceBasicAuth) {
    res = await fetch(out.toString(), { cache: 'no-store', headers: tryHeaders(bearer) })
    console.log('=== BEARER AUTH ATTEMPT ===')
    console.log('Bearer token available:', !!bearer)
    console.log('Bearer response status:', res.status)
    if (res.ok) {
      console.log('=== Bearer Auth SUCCESS ===')
      return forward(res, out.toString())
    }
    console.log('Comments API: Bearer fetch failed:', res.status)
  } else {
    console.log('=== SKIPPING BEARER AUTH (force Basic Auth requested) ===')
  }

  // 2) Try Basic Auth (Application Password) if configured
  const basicUser = process.env.WP_USER || process.env.WP_API_USER
  const basicPass = process.env.WP_APP_PASSWORD || process.env.WP_API_APP_PASSWORD
  if (basicUser && basicPass) {
    const token = Buffer.from(`${basicUser}:${basicPass}`).toString('base64')
    const basicAuthHeader = `Basic ${token}`
    
    // === DEBUG: Basic Auth Header ===
    console.log('=== BASIC AUTH DEBUG ===')
    console.log('Basic Auth username being sent:', JSON.stringify(basicUser))
    console.log('Basic Auth password length:', basicPass.length)
    // Decode the first part to show the username part (for debugging)
    const decodedForDebug = Buffer.from(token, 'base64').toString('utf-8')
    const [usernameDebug] = decodedForDebug.split(':')
    console.log('Decoded username from Basic Auth:', JSON.stringify(usernameDebug))
    console.log('Basic Auth header (masked):', `Basic ${token.substring(0, 20)}...`)
    
    console.log('Making Basic Auth request to:', out.toString())
    res = await fetch(out.toString(), { 
      cache: 'no-store', 
      headers: { Authorization: basicAuthHeader } 
    })
    console.log('Basic Auth response status:', res.status)
    console.log('Basic Auth response headers:', Object.fromEntries(res.headers.entries()))
    
    if (res.ok) {
      console.log('=== Basic Auth SUCCESS ===')
      return forward(res, out.toString())
    } else {
      console.log('=== Basic Auth FAILED ===')
      const errorText = await res.text()
      console.log('Basic Auth error response:', errorText.substring(0, 500))
      // Re-fetch for the fallback logic since we consumed the response
      res = await fetch(out.toString(), { 
        cache: 'no-store', 
        headers: { Authorization: basicAuthHeader } 
      })
    }
    console.log('Comments API: Basic auth fetch failed:', res.status)
  } else {
    console.log('=== Basic Auth SKIPPED - Missing credentials ===')
    console.log('basicUser available:', !!basicUser)
    console.log('basicPass available:', !!basicPass)
  }

  // If no res yet, make an unauthenticated request for the final error handling
  if (!res) {
    res = await fetch(out.toString(), { cache: 'no-store' })
    console.log('Fallback unauthenticated request status:', res.status)
  }

  // 3) Handle expected upstream errors gracefully
  console.log('=== FINAL ERROR HANDLING ===')
  console.log('Final response status:', res.status)
  if ([400, 404].includes(res.status)) {
    console.log('Returning empty array for expected error status:', res.status)
    return Response.json([], { status: 200, headers: { 'Cache-Control': 'public, max-age=30', 'X-Upstream-Status': String(res.status), 'X-Upstream-Url': out.toString() } })
  }
  console.log('Returning upstream error with status:', res.status)
  console.log('=== COMMENTS API DEBUG END ===')
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
