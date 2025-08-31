import { apiMap } from '@/lib/wpAPIMap'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const base = apiMap.analytics.referers
  if (!base) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })
  const inUrl = new URL(req.url)
  const period = inUrl.searchParams.get('period') || 'month'
  const u = new URL(base)
  u.searchParams.set('period', period)
  return fetchWithAuth(req, u.toString())
}
