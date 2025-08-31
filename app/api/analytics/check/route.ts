import { apiMap } from '@/lib/wpAPIMap'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = apiMap.analytics.check
  if (!url) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })
  return fetchWithAuth(req, url)
}
