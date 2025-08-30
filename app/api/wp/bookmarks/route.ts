export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getWpBase() {
  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  if (!WP) throw new Error('WP_URL env required')
  return WP.replace(/\/$/, '')
}

async function forward(req: Request, path: string, init?: RequestInit) {
  const base = getWpBase()
  const url = new URL(`/wp-json/fe-auth/v1${path}`, base)
  const incomingCookies = req.headers.get('cookie') || ''
  const ua = req.headers.get('user-agent') || 'techoblivion-next-proxy'
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim()
  const r = await fetch(url.toString(), {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(incomingCookies ? { cookie: incomingCookies } : {}),
      'User-Agent': ua,
      ...(ip ? { 'X-Forwarded-For': ip } : {}),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })
  const text = await r.text()
  return new Response(text || '{}', {
    status: r.status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId') || searchParams.get('post_id')
    if (postId) {
      // Check bookmark state and count for a post
      return await forward(req, `/bookmarks/check?post_id=${encodeURIComponent(postId)}`)
    }
    // List bookmarks for current user
    return await forward(req, '/bookmarks')
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'server error', detail: String(e?.message || e) }), { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    let body: any
    try { body = await req.json() } catch { body = null }
    const postId = Number(body?.postId ?? body?.post_id ?? 0)
    if (!postId || !Number.isFinite(postId)) {
      return new Response(JSON.stringify({ error: 'postId required' }), { status: 400 })
    }
    return await forward(req, '/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ post_id: postId }),
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'server error', detail: String(e?.message || e) }), { status: 500 })
  }
}
