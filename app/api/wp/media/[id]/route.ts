import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const WP = (process.env.WP_URL || '').replace(/\/$/, '')

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  return fetchWithAuth(req, `${WP}/wp-json/fe-media/v1/media/${params.id}`, { method: 'DELETE' })
}
