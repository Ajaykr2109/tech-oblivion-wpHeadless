import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL ?? ''
  if (!WP) return NextResponse.json({ error: 'WP_URL missing' }, { status: 500 })
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  if (!q) return NextResponse.json([], { status: 200 })

  const url = new URL('/wp-json/wp/v2/posts', WP)
  url.searchParams.set('_embed', '0')
  url.searchParams.set('search', q)
  url.searchParams.set('per_page', '10')
  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json', 'User-Agent': 'techoblivion-proxy/1.0 (+https://techoblivion.in)' },
    next: { revalidate: Number(process.env.WP_CACHE_TTL || 300) },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    return NextResponse.json({ error: 'Upstream error', status: res.status, message: body }, { status: 502 })
  }
  const data = await res.json()
  return NextResponse.json(data, { status: 200 })
}
