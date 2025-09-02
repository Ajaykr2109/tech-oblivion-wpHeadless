import { apiMap } from '@/lib/wpAPIMap'
import { fetchWithAuth, MissingWpTokenError } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const base = apiMap.analytics.views
    if (!base) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })
    const inUrl = new URL(req.url)
    const period = inUrl.searchParams.get('period') || 'month'
    const postId = inUrl.searchParams.get('postId')
    const u = new URL(base)
    u.searchParams.set('period', period)
    if (postId) u.searchParams.set('post_id', postId)
    return await fetchWithAuth(req, u.toString())
  } catch (err: unknown) {
    if (err instanceof MissingWpTokenError) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: err.message }), { status: err.status, headers: { 'Content-Type': 'application/json' } })
    }
    console.error('analytics.views unexpected error:', err)
    return new Response(JSON.stringify({ error: 'proxy_error', message: 'Failed to fetch analytics views' }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }
}
