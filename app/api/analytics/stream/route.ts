import { getWpTokenFromRequest } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const WP = (process.env.WP_URL || '').replace(/\/$/, '')

export async function GET(req: Request) {
  if (!WP) return new Response('WP_URL not set', { status: 500 })
  const token = await getWpTokenFromRequest(req)
  if (!token) return new Response('Unauthorized', { status: 401 })
  const upstream = await fetch(`${WP}/wp-json/fe-analytics/v1/stream`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Cookie: `Authorization=Bearer ${token}`,
      Accept: 'text/event-stream',
    },
  })
  if (!upstream.body) return new Response('No stream', { status: 502 })
  return new Response(upstream.body, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } })
}
