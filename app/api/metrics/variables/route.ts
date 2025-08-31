import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const WP = (process.env.WP_URL || '').replace(/\/$/, '')

export async function GET(req: Request) {
  // Virtual vars can be enriched on FE; for now proxy a WP endpoint if present, else return a basic set
  if (WP) {
    try { return await fetchWithAuth(req, `${WP}/wp-json/fe-metrics/v1/variables`) } catch {}
  }
  return Response.json([
    { name: 'views', endpoint: '/api/analytics/views' },
    { name: 'sessions', endpoint: '/api/analytics/sessions' },
    { name: 'comments', endpoint: '/api/wp/comments' },
    { name: 'users', endpoint: '/api/wp/users' },
  ])
}
