import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const WP = (process.env.WP_URL || '').replace(/\/$/, '')

export async function POST(req: Request) {
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  const body = await req.text()
  return fetchWithAuth(req, `${WP}/wp-json/fe-metrics/v1/layout/default`, { method: 'POST', body, headers: { 'Content-Type': 'application/json' } })
}
