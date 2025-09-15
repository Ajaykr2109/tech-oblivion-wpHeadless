export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createHmac } from 'crypto'

import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

import { verifySession } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })

  const incoming = new URL(req.url)
  const id = incoming.searchParams.get('id')
  
  // Build query with sensible defaults
  const search = new URLSearchParams(incoming.search)
  if (!search.has('per_page')) search.set('per_page', '20')
  if (!search.has('orderby')) search.set('orderby', 'date')
  if (!search.has('order')) search.set('order', 'desc')

  // Debug: Log the post parameter
  const postParam = search.get('post')
  const authorParam = search.get('author')
  console.log('Comments API: post parameter received:', postParam)
  console.log('Comments API: author parameter received:', authorParam)
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

  // Try MU proxy first when available (re-enabled for debugging)
  const secret = process.env.FE_PROXY_SECRET || ''
  const path = 'wp/v2/comments'
  if (secret) {
    const proxy = new URL('/wp-json/fe-auth/v1/proxy', WP)
    proxy.searchParams.set('path', path)
    search.forEach((v, k) => proxy.searchParams.set(`query[${k}]`, v))
    const ts = String(Math.floor(Date.now() / 1000))
    const base = `GET\n${path}\n${ts}\n`
    const sign = createHmac('sha256', secret).update(base).digest('base64')
    console.log('Comments API: Using proxy with URL:', proxy.toString())
    const res = await fetch(proxy.toString(), { headers: { 'x-fe-ts': ts, 'x-fe-sign': sign }, cache: 'no-store' })
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
      return new Response(text, { status: 200, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'public, max-age=60', 'X-Upstream': 'proxy', 'X-Upstream-Url': proxy.toString() } })
    } else {
      console.log('Comments API: Proxy failed with status:', res.status, res.statusText)
    }
  }

  const out = id ? new URL(`/wp-json/wp/v2/comments/${id}`, WP) : new URL('/wp-json/wp/v2/comments', WP)
  if (!id) search.forEach((v, k) => out.searchParams.set(k, v))
  console.log('Comments API: Final WordPress URL:', out.toString())
  const authHeader = req.headers.get('authorization')
  const res = await fetch(out.toString(), { cache: 'no-store', headers: { ...(authHeader ? { Authorization: authHeader } : {}) } })
  if (!res.ok) {
    console.log('Comments API: WordPress response not OK:', res.status, res.statusText)
    if (res.status === 404 || res.status === 400) {
      return Response.json([], { status: 200, headers: { 'Cache-Control': 'public, max-age=30', 'X-Upstream-Status': String(res.status), 'X-Upstream-Url': out.toString() } })
    }
    return new Response('Upstream error', { status: res.status })
  }

  const text = await res.text()
  console.log('Comments API: WordPress response length:', text.length)
  
  // Parse response to check filtering
  try {
    const data = JSON.parse(text)
    if (Array.isArray(data)) {
      console.log('Comments API: Number of comments received:', data.length)
      console.log('Comments API: Post IDs in comments:', data.map(c => c.post).slice(0, 5))
    }
  } catch {
    console.log('Comments API: Failed to parse response for debugging')
  }
  
  return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60', 'X-Upstream-Url': out.toString() } })
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
  try { body = await req.json() } catch { 
    // ignore parse error
    body = {} 
  }
  const content = ((body as Record<string, unknown>)?.content ?? '').toString().trim()
  const postId = Number((body as Record<string, unknown>)?.postId)
  const parent = (body as Record<string, unknown>)?.parent ? Number((body as Record<string, unknown>).parent) : undefined
  if (!content || !postId) return new Response('content and postId are required', { status: 400 })

  // Forward to WP REST API
  const wpRes = await fetch(new URL('/wp-json/wp/v2/comments', WP), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${wpToken}` },
    body: JSON.stringify({ content, post: postId, parent }),
    cache: 'no-store',
  } as RequestInit)
  const text = await wpRes.text()
  return new Response(text, { status: wpRes.status, headers: { 'Content-Type': wpRes.headers.get('Content-Type') || 'application/json' } })
}
