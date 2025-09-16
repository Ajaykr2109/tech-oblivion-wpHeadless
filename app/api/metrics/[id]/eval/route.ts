import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const WP = (process.env.WP_URL || '').replace(/\/$/, '')

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  const { id } = await context.params
  return fetchWithAuth(req, `${WP}/wp-json/fe-metrics/v1/metrics/${id}/eval`)
}
