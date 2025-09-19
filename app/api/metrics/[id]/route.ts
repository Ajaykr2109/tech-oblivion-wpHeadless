import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const WP = (process.env.WP_URL || '').replace(/\/$/, '')

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  const { id } = await context.params
  return fetchWithAuth(req, `${WP}/wp-json/fe-metrics/v1/metrics/${id}`)
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  const { id } = await context.params
  const body = await req.text()
  return fetchWithAuth(req, `${WP}/wp-json/fe-metrics/v1/metrics/${id}`, { method: 'PUT', body, headers: { 'Content-Type': 'application/json' } })
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  const { id } = await context.params
  return fetchWithAuth(req, `${WP}/wp-json/fe-metrics/v1/metrics/${id}`, { method: 'DELETE' })
}
