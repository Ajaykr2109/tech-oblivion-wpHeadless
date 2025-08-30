export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'
import { createHmac } from 'crypto'

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })

  const incoming = new URL(req.url)
  
  // Build query with sensible defaults
  const search = new URLSearchParams(incoming.search)
  if (!search.has('per_page')) search.set('per_page', '20')
  if (!search.has('orderby')) search.set('orderby', 'date')
  if (!search.has('order')) search.set('order', 'desc')

  // Try MU proxy first when available
  const secret = process.env.FE_PROXY_SECRET || ''
  const path = 'wp/v2/comments'
  if (secret) {
    const proxy = new URL('/wp-json/fe-auth/v1/proxy', WP)
    proxy.searchParams.set('path', path)
    search.forEach((v, k) => proxy.searchParams.set(`query[${k}]`, v))
    const ts = String(Math.floor(Date.now() / 1000))
    const base = `GET\n${path}\n${ts}\n`
    const sign = createHmac('sha256', secret).update(base).digest('base64')
    const res = await fetch(proxy.toString(), { headers: { 'x-fe-ts': ts, 'x-fe-sign': sign }, cache: 'no-store' })
    if (res.ok) {
      const text = await res.text()
      return new Response(text, { status: 200, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'public, max-age=60', 'X-Upstream': 'proxy', 'X-Upstream-Url': proxy.toString() } })
    }
  }

  const out = new URL('/wp-json/wp/v2/comments', WP)
  search.forEach((v, k) => out.searchParams.set(k, v))
  const res = await fetch(out.toString(), { cache: 'no-store' })
  if (!res.ok) {
    if (res.status === 404 || res.status === 400) {
      return Response.json([], { status: 200, headers: { 'Cache-Control': 'public, max-age=30', 'X-Upstream-Status': String(res.status), 'X-Upstream-Url': out.toString() } })
    }
    return new Response('Upstream error', { status: res.status })
  }

  const text = await res.text()
  return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60', 'X-Upstream-Url': out.toString() } })
}

export async function POST() {
  return new Response(JSON.stringify({ message: 'Not implemented' }), { status: 501 })
}
