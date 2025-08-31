import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const WP = (process.env.WP_URL || '').replace(/\/$/, '')

export async function GET(req: Request) {
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  return fetchWithAuth(req, `${WP}/wp-json/fe-analytics/v1/sessions/timeseries`)
}
