import { getWpTokenFromRequest } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const WP = process.env.WP_URL
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  const inUrl = new URL(req.url)
  const status = inUrl.searchParams.get('status') || ''
  const u = new URL('/wp-json/wp/v2/posts', WP)
  u.searchParams.set('per_page', '1')
  if (status) u.searchParams.set('status', status)

  // Include auth when available; required for non-public statuses like draft/pending
  const token = await getWpTokenFromRequest(req)
  const headers: Record<string, string> = {
    'User-Agent': 'techoblivion-fe/1.0',
    'Accept': 'application/json',
  }
  if (token) headers.Authorization = `Bearer ${token}`
  if (!token && status && status !== 'publish') {
    return Response.json({ error: 'unauthorized', message: 'Login required for non-public post statuses' }, { status: 401 })
  }

  const res = await fetch(u.toString(), { cache: 'no-store', headers })
  const total = res.headers.get('x-wp-total') as string | null
  return Response.json({ count: total ? Number(total) : (res.ok ? 0 : null) }, { status: res.ok ? 200 : res.status })
}
