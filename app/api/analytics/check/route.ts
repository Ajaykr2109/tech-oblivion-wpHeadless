import { apiMap } from '@/lib/wpAPIMap'
import { fetchWithAuth, MissingWpTokenError } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = apiMap.analytics.check
    if (!url) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })
    return await fetchWithAuth(req, url)
  } catch (err: unknown) {
    if (err instanceof MissingWpTokenError) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: err.message }), { status: err.status, headers: { 'Content-Type': 'application/json' } })
    }
    console.error('analytics.check unexpected error:', err)
    return new Response(JSON.stringify({ error: 'proxy_error', message: 'Failed to check analytics' }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }
}
