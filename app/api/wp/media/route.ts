import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const WP = (process.env.WP_URL || '').replace(/\/$/, '')

export async function GET(req: Request) {
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  const url = new URL(`${WP}/wp-json/fe-media/v1/media`)
  const inUrl = new URL(req.url)
  inUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v))
  return fetchWithAuth(req, url.toString())
}

export async function POST(req: Request) {
  if (!WP) return Response.json({ error: 'WP_URL env required' }, { status: 500 })
  // Pass through multipart form-data
  const body = await req.arrayBuffer()
  const headers: HeadersInit = { 'Content-Type': req.headers.get('content-type') || 'application/octet-stream' }
  return fetchWithAuth(req, `${WP}/wp-json/fe-media/v1/media`, { method: 'POST', body: body as any, headers })
}
