import { getWpTokenFromRequest } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const WP = process.env.WP_URL
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  const token = await getWpTokenFromRequest(req)
  if (!token) return Response.json({ error: 'unauthorized', message: 'Login required' }, { status: 401 })

  const u = new URL('/wp-json/wp/v2/users', WP)
  u.searchParams.set('per_page', '1')
  u.searchParams.set('context', 'edit')
  u.searchParams.set('_fields', 'id')
  const res = await fetch(u.toString(), { cache: 'no-store', headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
  const total = res.headers.get('x-wp-total')
  return Response.json({ count: total ? Number(total) : (res.ok ? 0 : null) }, { status: res.ok ? 200 : res.status })
}
