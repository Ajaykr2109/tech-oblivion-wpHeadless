import { createHmac } from 'crypto'

import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

import { verifySession } from '@/lib/jwt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SessionClaims = {
  roles?: string[]
  wpToken?: string
  wpUserId?: string | number
}

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })
  
  const incoming = new URL(req.url);
  
  // Prepare defaults and normalized params
  const search = new URLSearchParams(incoming.search)
  const id = search.get('id')
  if (search.has('perPage')) {
    search.set('per_page', search.get('perPage')!)
    search.delete('perPage')
  }
  if (!search.has('_embed')) search.set('_embed', '1')
  if (!search.has('per_page')) search.set('per_page', '10')
  
  // WordPress REST API expects 'author' as array parameter, so convert single values
  const authorParam = search.get('author')
  if (authorParam && !search.has('author[]')) {
    search.delete('author')
    search.append('author[]', authorParam)
  }

  // Try MU proxy first if configured (helps on locked-down sites)
  const secret = '' // Temporarily disable proxy to test direct WordPress API
  const path = 'wp/v2/posts'
  if (secret) {
    const proxy = new URL('/wp-json/fe-auth/v1/proxy', WP)
    proxy.searchParams.set('path', path)
    // forward query params under query[...]
    search.forEach((v, k) => proxy.searchParams.set(`query[${k}]`, v))
    const ts = String(Math.floor(Date.now() / 1000))
    const base = `GET\n${path}\n${ts}\n`
    const sign = createHmac('sha256', secret).update(base).digest('base64')
    const res = await fetch(proxy.toString(), { headers: { 'x-fe-ts': ts, 'x-fe-sign': sign }, cache: 'no-store' })
    if (res.ok) {
      const text = await res.text()
      return new Response(text, { status: 200, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'public, max-age=60', 'X-Upstream': 'proxy', 'X-Upstream-Url': proxy.toString() } })
    }
    // fall through to direct
  }

  const out = id ? new URL(`/wp-json/wp/v2/posts/${id}`, WP) : new URL('/wp-json/wp/v2/posts', WP)
  if (!id) search.forEach((v, k) => out.searchParams.set(k, v))
  
  // Forward Authorization header if present
  let authHeader = req.headers.get('authorization') || undefined
  // If fetching a single post without Authorization, attempt to use session wpToken (to allow drafts access)
  if (id && !authHeader) {
    try {
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
      if (sessionCookie?.value) {
        const claims = (await verifySession(sessionCookie.value)) as SessionClaims
        if (claims?.wpToken) authHeader = `Bearer ${claims.wpToken}`
      }
    } catch {
      // TODO: implement better logging for session parse errors
    }
  }
  const res = await fetch(out, { 
    cache: 'no-store', 
    headers: { 
      ...(authHeader ? { Authorization: authHeader } : {}),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    } 
  })
  if (!res.ok) {
    if (res.status === 404 || res.status === 400) {
      return Response.json([], { status: 200, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'X-Upstream-Status': String(res.status), 'X-Upstream-Url': out.toString() } })
    }
    return new Response('Upstream error', { status: res.status })
  }
  const jsonData = await res.json()
  return Response.json(jsonData, { 
    headers: { 
      'Cache-Control': 'no-cache, no-store, must-revalidate', 
      'Pragma': 'no-cache',
      'X-Upstream-Url': out.toString() 
    } 
  })
}

// Create a post (requires at least 'author' role)
export async function POST(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  if (!sessionCookie?.value) return new Response('Unauthorized', { status: 401 })
  let claims: SessionClaims
  try { claims = (await verifySession(sessionCookie.value)) as SessionClaims } catch { 
    // ignore session parse error
    return new Response('Unauthorized', { status: 401 }) 
  }
  const roles: string[] = Array.isArray(claims.roles) ? claims.roles : []
  if (!roles.some(r => ['author','editor','administrator'].includes(r))) {
    return new Response('Forbidden', { status: 403 })
  }
  const wpToken = claims.wpToken
  if (!wpToken) return new Response('Missing upstream token', { status: 401 })

  // Parse body; if tags are names, resolve to IDs
  const raw = await req.text()
  let bodyJson: unknown
  try { bodyJson = raw ? JSON.parse(raw) : {} } catch { 
    // ignore parse error
    bodyJson = {} 
  }
  if (
    bodyJson &&
    typeof bodyJson === 'object' &&
    'tags' in (bodyJson as Record<string, unknown>) &&
    Array.isArray((bodyJson as { tags: unknown[] }).tags) &&
    (bodyJson as { tags: unknown[] }).tags.length > 0 &&
    typeof (bodyJson as { tags: unknown[] }).tags[0] === 'string'
  ) {
    try {
      const names: string[] = (bodyJson as { tags: string[] }).tags
      const resolveRes = await fetch(new URL('/api/wp/tags/resolve', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ names }), cache: 'no-store'
      })
      if (resolveRes.ok) {
        const j = await resolveRes.json()
  ;(bodyJson as { tags: unknown }).tags = Array.isArray(j?.ids) ? j.ids : []
      }
    } catch {
      // TODO: handle tag resolve errors gracefully
    }
  }
  const res = await fetch(new URL('/wp-json/wp/v2/posts', WP), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${wpToken}` },
    body: JSON.stringify(bodyJson ?? {}),
  })
  const text = await res.text()
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}

// Update a post (requires capability: own post for authors; any for editor/admin)
export async function PATCH(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })
  const incoming = new URL(req.url)
  const id = incoming.searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  if (!sessionCookie?.value) return new Response('Unauthorized', { status: 401 })
  let claims: SessionClaims
  try { claims = (await verifySession(sessionCookie.value)) as SessionClaims } catch { 
    // ignore session parse error
    return new Response('Unauthorized', { status: 401 }) 
  }
  const roles: string[] = Array.isArray(claims.roles) ? claims.roles : []
  if (!roles.some(r => ['author','editor','administrator'].includes(r))) {
    return new Response('Forbidden', { status: 403 })
  }
  const wpToken = claims.wpToken
  if (!wpToken) return new Response('Missing upstream token', { status: 401 })

  // Optional: ownership check for authors by fetching the post first
  if (roles.includes('author') && !roles.some(r => ['editor','administrator'].includes(r))) {
    const postRes = await fetch(new URL(`/wp-json/wp/v2/posts/${id}`, WP), { headers: { Authorization: `Bearer ${wpToken}` } })
    if (postRes.ok) {
      const post = await postRes.json()
  if ((post as Record<string, unknown>)?.author && String((post as Record<string, unknown>).author) !== String(claims.wpUserId)) {
        return new Response('Forbidden', { status: 403 })
      }
    }
  }

  const raw = await req.text()
  let bodyJson: unknown
  try { bodyJson = raw ? JSON.parse(raw) : {} } catch { bodyJson = {} }
  if (
    bodyJson &&
    typeof bodyJson === 'object' &&
    'tags' in (bodyJson as Record<string, unknown>) &&
    Array.isArray((bodyJson as { tags: unknown[] }).tags) &&
    (bodyJson as { tags: unknown[] }).tags.length > 0 &&
    typeof (bodyJson as { tags: unknown[] }).tags[0] === 'string'
  ) {
    try {
      const names: string[] = (bodyJson as { tags: string[] }).tags
      const resolveRes = await fetch(new URL('/api/wp/tags/resolve', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ names }), cache: 'no-store'
      })
      if (resolveRes.ok) {
        const j = await resolveRes.json()
  ;(bodyJson as { tags: unknown }).tags = Array.isArray(j?.ids) ? j.ids : []
      }
    } catch {
      // TODO: handle tag resolve errors gracefully
    }
  }
  const res = await fetch(new URL(`/wp-json/wp/v2/posts/${id}`, WP), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${wpToken}` },
    body: JSON.stringify(bodyJson ?? {}),
  })
  const text = await res.text()
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}

// Delete a post
export async function DELETE(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })
  const incoming = new URL(req.url)
  const id = incoming.searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  if (!sessionCookie?.value) return new Response('Unauthorized', { status: 401 })
  let claims: SessionClaims
  try { claims = (await verifySession(sessionCookie.value)) as SessionClaims } catch { 
    // ignore session parse error
    return new Response('Unauthorized', { status: 401 }) 
  }
  const roles: string[] = Array.isArray(claims.roles) ? claims.roles : []
  if (!roles.some(r => ['editor','administrator'].includes(r))) {
    return new Response('Forbidden', { status: 403 })
  }
  const wpToken = claims.wpToken
  if (!wpToken) return new Response('Missing upstream token', { status: 401 })

  const controller = new AbortController()
  const to = setTimeout(() => controller.abort(), 10_000)
  try {
    const res = await fetch(new URL(`/wp-json/wp/v2/posts/${id}`, WP), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${wpToken}` },
      signal: controller.signal,
    })
    const text = await res.text()
    return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
  } catch (e: unknown) {
    const err = e as { name?: string; message?: string }
    const msg = err?.name === 'AbortError' ? 'Upstream timeout' : (err?.message || 'Upstream error')
    return new Response(JSON.stringify({ error: msg }), { status: 504, headers: { 'Content-Type': 'application/json' } })
  } finally {
    clearTimeout(to)
  }
}
