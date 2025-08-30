import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type PopularItem = { id: number } | { post_id: number }

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  if (!WP) return NextResponse.json({ error: 'WP_URL missing' }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const range = (searchParams.get('range') || 'month').toLowerCase() // day|week|month|all
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 6), 1), 12)

  // Try WordPress Popular Posts REST API first
  const base = new URL('/wp-json/wordpress-popular-posts', WP.replace(/\/$/, ''))
  const wppUrl = new URL('/v1/popular-posts', base)
  wppUrl.searchParams.set('range', ['day','week','month','all'].includes(range) ? range : 'month')
  wppUrl.searchParams.set('limit', String(limit))

  let ids: number[] = []
  try {
    const wppRes = await fetch(wppUrl.toString(), { headers: { Accept: 'application/json' }, next: { revalidate: 600 } })
    if (wppRes.ok) {
      const items = (await wppRes.json()) as PopularItem[]
      ids = (items || []).map((i: any) => Number(i.id ?? i.post_id)).filter((n) => Number.isFinite(n))
    }
  } catch {}

  // Fallback: empty or failed -> use latest posts as a reasonable default
  let posts: any[] = []
  try {
    if (ids.length) {
      const detailsUrl = new URL('/wp-json/wp/v2/posts', WP)
      detailsUrl.searchParams.set('include', ids.join(','))
      detailsUrl.searchParams.set('_embed', '1')
      detailsUrl.searchParams.set('per_page', String(limit))
      const res = await fetch(detailsUrl.toString(), { headers: { Accept: 'application/json' }, next: { revalidate: 600 } })
      if (res.ok) {
        posts = await res.json()
        // Keep the order of ids from WPP
        const order = new Map(ids.map((id, idx) => [id, idx]))
        posts.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
      }
    } else {
      const latestUrl = new URL('/wp-json/wp/v2/posts', WP)
      latestUrl.searchParams.set('_embed', '1')
      latestUrl.searchParams.set('per_page', String(limit))
      const res = await fetch(latestUrl.toString(), { headers: { Accept: 'application/json' }, next: { revalidate: 300 } })
      if (res.ok) posts = await res.json()
    }
  } catch (e) {
    return NextResponse.json({ error: 'Upstream error', detail: String(e) }, { status: 502 })
  }

  const simplified = (posts as any[]).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title?.rendered || p.title || '',
    excerpt: (p.excerpt?.rendered || '').replace(/<[^>]+>/g, ''),
    featuredImage: p._embedded?.['wp:featuredmedia']?.[0]?.source_url || p.featured_media_url || p.jetpack_featured_media_url || '',
    authorName: p._embedded?.author?.[0]?.name || '',
    date: p.date || '',
  }))
  return NextResponse.json(simplified, { status: 200, headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' } })
}
