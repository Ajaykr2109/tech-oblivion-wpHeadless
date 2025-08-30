export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type PublicUser = {
  id: number
  name?: string
  slug: string
  description?: string
  avatar_urls?: Record<string, string>
  profile_fields?: Record<string, unknown> | null
}

function sanitize(u: any): PublicUser {
  return {
    id: Number(u?.id ?? 0),
    name: u?.name ?? u?.display_name,
    slug: String(u?.slug ?? ''),
    description: u?.description ?? '',
    avatar_urls: u?.avatar_urls ?? {},
    profile_fields: u?.profile_fields ?? null,
  }
}

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  if (!WP) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })

  const base = WP.replace(/\/$/, '')
  const url = new URL(`/wp-json/fe-auth/v1/public-user/${encodeURIComponent(slug)}`, base)

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (res.status === 404) {
      return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    if (!res.ok) {
      // Mask upstream errors
      return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    const data = await res.json().catch(() => null)
    if (!data || typeof data !== 'object') {
      return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    const out = sanitize(data)
    if (!out.slug) {
      return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
  }
}
