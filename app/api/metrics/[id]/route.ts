import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const WP = (process.env.WP_URL || '').replace(/\/$/, '')

export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  return fetchWithAuth(req, `${WP}/wp-json/fe-metrics/v1/metrics/${params.id}`)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  const body = await req.text()
  return fetchWithAuth(req, `${WP}/wp-json/fe-metrics/v1/metrics/${params.id}`, { method: 'PUT', body, headers: { 'Content-Type': 'application/json' } })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  return fetchWithAuth(req, `${WP}/wp-json/fe-metrics/v1/metrics/${params.id}`, { method: 'DELETE' })
}
