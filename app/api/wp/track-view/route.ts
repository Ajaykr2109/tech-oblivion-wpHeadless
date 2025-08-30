export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  if (!WP) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })
  let body: any
  try { body = await req.json() } catch { body = null }
  const postId = Number(body?.postId ?? body?.post_id ?? 0)
  if (!postId || !Number.isFinite(postId)) {
    return new Response(JSON.stringify({ error: 'postId required' }), { status: 400 })
  }
  const url = new URL('/wp-json/fe-auth/v1/track-view', WP.replace(/\/$/, ''))
  try {
    const incomingCookies = req.headers.get('cookie') || ''
    const ua = req.headers.get('user-agent') || 'techoblivion-next-proxy'
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim()
    const r = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Forward cookies to allow WP to detect logged-in users
        ...(incomingCookies ? { cookie: incomingCookies } : {}),
        'User-Agent': ua,
        ...(ip ? { 'X-Forwarded-For': ip } : {}),
      },
      cache: 'no-store',
      body: JSON.stringify({ post_id: postId })
    })
    const text = await r.text()
    if (!r.ok) {
      return new Response(text || JSON.stringify({ error: 'wp error' }), { status: r.status })
    }
    return new Response(text || '{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'upstream error', detail: String(e) }), { status: 502 })
  }
}
