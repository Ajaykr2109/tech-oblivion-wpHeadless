import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })

  const incoming = new URL(req.url)
  const out = new URL('/wp-json/wp/v2/posts', WP)
  // pass through known filters
  const pass = ['categories','tags','exclude','per_page','page','_embed']
  for (const k of pass) {
    const v = incoming.searchParams.get(k)
    if (v) out.searchParams.set(k, v)
  }
  if (!out.searchParams.has('_embed')) out.searchParams.set('_embed', '1')
  if (!out.searchParams.has('per_page')) out.searchParams.set('per_page', '5')

  const res = await fetch(out.toString(), { cache: 'no-store' })
  if (!res.ok) return new Response('Upstream error', { status: res.status })
  const arr = await res.json()
  const simplified = Array.isArray(arr) ? arr.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    title: p.title?.rendered,
    date: p.date,
    featuredImage: p._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null,
  })) : []
  return Response.json(simplified, { headers: { 'Cache-Control': 'public, max-age=60' } })
}
