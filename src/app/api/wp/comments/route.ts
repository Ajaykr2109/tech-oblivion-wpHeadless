export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })

  const incoming = new URL(req.url)
  const out = new URL('/wp-json/wp/v2/comments', WP)

  // Pass through supported params generically (e.g., author, post, per_page, page, search)
  incoming.searchParams.forEach((v, k) => out.searchParams.set(k, v))

  // Defaults
  if (!out.searchParams.has('per_page')) out.searchParams.set('per_page', '20')
  if (!out.searchParams.has('orderby')) out.searchParams.set('orderby', 'date')
  if (!out.searchParams.has('order')) out.searchParams.set('order', 'desc')

  const res = await fetch(out.toString(), { cache: 'no-store' })
  if (!res.ok) return new Response('Upstream error', { status: res.status })

  const text = await res.text()
  return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' } })
}

export async function POST() {
  return new Response(JSON.stringify({ message: 'Not implemented' }), { status: 501 })
}
