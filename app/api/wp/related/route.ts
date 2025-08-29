import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL ?? ''
  if (!WP) return NextResponse.json({ error: 'WP_URL missing' }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const categories = searchParams.get('categories') || ''
  const tags = searchParams.get('tags') || ''
  const exclude = searchParams.get('exclude') || ''
  const per_page = searchParams.get('per_page') || '5'

  const url = new URL('/wp-json/wp/v2/posts', WP)
  url.searchParams.set('_embed', '1')
  if (categories) url.searchParams.set('categories', categories)
  if (tags) url.searchParams.set('tags', tags)
  if (exclude) url.searchParams.set('exclude', exclude)
  url.searchParams.set('per_page', per_page)

  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json', 'User-Agent': 'techoblivion-proxy/1.0 (+https://techoblivion.in)' },
    next: { revalidate: Number(process.env.WP_CACHE_TTL || 300) },
  })
  if (!res.ok) {
    const body = await res.text()
    return NextResponse.json({ error: 'Upstream error', status: res.status, message: body }, { status: 502 })
  }
  const data = await res.json()
  const simplified = (data as any[]).map(p => ({ id: p.id, slug: p.slug, title: { rendered: p.title?.rendered || '' } }))
  return NextResponse.json(simplified, { status: 200 })
}
