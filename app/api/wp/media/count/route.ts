import { getWpTokenFromRequest } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const WP = process.env.WP_URL
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  const inUrl = new URL(req.url)
  const mediaType = inUrl.searchParams.get('media_type') || ''
  const u = new URL('/wp-json/wp/v2/media', WP)
  u.searchParams.set('per_page', '1')
  if (mediaType) u.searchParams.set('media_type', mediaType)

  const token = await getWpTokenFromRequest(req)
  const headers: Record<string, string> = {
    'User-Agent': 'techoblivion-fe/1.0',
    'Accept': 'application/json',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(u.toString(), { cache: 'no-store', headers })
  const total = res.headers.get('x-wp-total') as string | null
  return Response.json({ count: total ? Number(total) : (res.ok ? 0 : null) }, { status: res.ok ? 200 : res.status })
}
