export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { fetchWithAuth, MissingWpTokenError } from '@/lib/fetchWithAuth'

function getWpBase() {
  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  if (!WP) throw new Error('WP_URL env required')
  return WP.replace(/\/$/, '')
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId') || searchParams.get('post_id')
    const expand = searchParams.get('expand')
    const base = getWpBase()
    if (postId) {
      const url = new URL('/wp-json/fe-auth/v1/bookmarks/check', base)
      url.searchParams.set('post_id', String(postId))
      return await fetchWithAuth(req, url.toString())
    }
    const url = new URL('/wp-json/fe-auth/v1/bookmarks', base)
    if (expand) url.searchParams.set('expand', expand)
    return await fetchWithAuth(req, url.toString())
  } catch (e: any) {
    if (e instanceof MissingWpTokenError) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Login required to use bookmarks' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }
    console.error('bookmarks.GET unexpected error:', e)
    return new Response(JSON.stringify({ error: 'server_error', detail: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function POST(req: Request) {
  try {
    let body: any
    try { body = await req.json() } catch { body = null }
    const postId = Number(body?.postId ?? body?.post_id ?? 0)
    if (!postId || !Number.isFinite(postId)) {
      return new Response(JSON.stringify({ error: 'postId required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    const base = getWpBase()
    const url = new URL('/wp-json/fe-auth/v1/bookmarks/toggle', base)
    return await fetchWithAuth(req, url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId }),
    })
  } catch (e: any) {
    if (e instanceof MissingWpTokenError) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Login required to save bookmarks' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }
    console.error('bookmarks.POST unexpected error:', e)
    return new Response(JSON.stringify({ error: 'server_error', detail: String(e?.message || e) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
