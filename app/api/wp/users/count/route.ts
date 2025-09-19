import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const WP = process.env.WP_URL
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })

  const base = WP.replace(/\/$/, '')
  const inUrl = new URL(req.url)
  const role = inUrl.searchParams.get('role') || ''
  const group = inUrl.searchParams.get('group') || ''

  async function countForRoles(roles: string[]): Promise<number> {
    let totalCount = 0
    for (const r of roles) {
      const u = new URL('/wp-json/wp/v2/users', base)
      u.searchParams.set('per_page', '1')
      u.searchParams.set('context', 'edit')
      u.searchParams.set('_fields', 'id')
      u.searchParams.append('roles[]', r)
      const res = await fetchWithAuth(req, u.toString(), { cache: 'no-store' })
      const hdr = res.headers.get('x-wp-total') || res.headers.get('X-WP-Total')
      const c = hdr ? Number(hdr) : 0
      totalCount += Number.isFinite(c) ? c : 0
    }
    return totalCount
  }

  if (group === 'creators') {
    const count = await countForRoles(['editor', 'author', 'contributor'])
    return Response.json({ count })
  }
  if (role) {
    const roles = role.split(',').map(s => s.trim()).filter(Boolean)
    const count = await countForRoles(roles)
    return Response.json({ count })
  }

  const u = new URL('/wp-json/wp/v2/users', base)
  u.searchParams.set('per_page', '1')
  u.searchParams.set('context', 'edit')
  u.searchParams.set('_fields', 'id')
  const res = await fetchWithAuth(req, u.toString(), { cache: 'no-store' })
  const hdr = res.headers.get('x-wp-total') || res.headers.get('X-WP-Total')
  const total = hdr ? Number(hdr) : (res.ok ? 0 : null)
  return Response.json({ count: total }, { status: res.ok ? 200 : res.status })
}
