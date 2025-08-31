import { apiMap } from '@/lib/wpAPIMap'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const base = apiMap.analytics.topPosts
    if (!base) {
      return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
    const inUrl = new URL(req.url)
    const period = inUrl.searchParams.get('period') || 'month'
    const limit = inUrl.searchParams.get('limit') || '10'
    const u = new URL(base)
    u.searchParams.set('period', period)
    u.searchParams.set('limit', limit)

    // Light caching to reduce WP load
    const resp = await fetchWithAuth(req, u.toString(), { next: { revalidate: 60 } })
    return resp
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : 'Failed to fetch top posts'
    return new Response(JSON.stringify({ error: 'proxy_error', message }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }
}
