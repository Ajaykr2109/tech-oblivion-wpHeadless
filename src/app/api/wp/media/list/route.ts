import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return Response.json({ error: 'WP_URL not configured' }, { status: 500 })

  const url = new URL('/wp-json/wp/v2/media', WP)
  const search = req.nextUrl.searchParams
  for (const [k, v] of search.entries()) url.searchParams.set(k, v)
  if (!url.searchParams.has('per_page')) url.searchParams.set('per_page', '20')

  const res = await fetch(url.toString(), {
    next: { revalidate: Number(process.env.WP_CACHE_TTL || 300) },
    headers: {
      'User-Agent': 'techoblivion-proxy/1.0 (+https://techoblivion.in)',
      'Accept': 'application/json',
      'Referer': WP,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    return Response.json({ error: 'upstream', status: res.status, body: body.slice(0, 2000) }, { status: 502 })
  }
  const data = await res.json()
  return Response.json({ items: data }, { status: 200 })
}
