export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type PublicUser = {
  id: number
  name?: string
  slug: string
  description?: string
  avatar_urls?: Record<string, string>
  profile_fields?: Record<string, unknown> | null
  recent_posts?: any[]
  recent_comments?: any[]
  social?: { twitter: string | null; linkedin: string | null; github: string | null }
}

function normalizeUrl(u?: string | null): string | null {
  if (!u) return null
  const s = String(u).trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s}`
}

function deriveSocial(u: any): { twitter: string | null; linkedin: string | null; github: string | null } {
  // Prefer explicit social object if backend/plugin supplies it
  if (u && typeof u.social === 'object' && u.social) {
    return {
      twitter: normalizeUrl((u.social as any).twitter ?? null),
      linkedin: normalizeUrl((u.social as any).linkedin ?? null),
      github: normalizeUrl((u.social as any).github ?? null),
    }
  }
  const pf = (u && typeof u.profile_fields === 'object') ? (u.profile_fields as Record<string, unknown>) : null
  const get = (k: string) => (pf && typeof pf[k] === 'string') ? (pf[k] as string) : undefined
  // Primary keys from user_meta
  const tw = (u?.twitter_url as string) || get('twitter_url') || get('twitter') || get('x')
  const ln = (u?.linkedin_url as string) || get('linkedin_url') || get('linkedin')
  const gh = (u?.github_url as string) || get('github_url') || get('github')
  return { twitter: normalizeUrl(tw || null), linkedin: normalizeUrl(ln || null), github: normalizeUrl(gh || null) }
}

function sanitize(u: any): PublicUser {
  const mapPost = (p: any) => ({
    id: Number(p?.id ?? 0),
    title: String(p?.title ?? p?.title?.rendered ?? ''),
    slug: String(p?.slug ?? ''),
    date: String(p?.date ?? p?.date_gmt ?? ''),
    link: String(p?.link ?? ''),
    content_raw: String(p?.content_raw ?? p?.content?.raw ?? ''),
    content_rendered: String(p?.content_rendered ?? p?.content?.rendered ?? ''),
  })
  const mapComment = (c: any) => ({
    id: Number(c?.id ?? 0),
    post: Number(c?.post ?? c?.post_id ?? 0),
    date: String(c?.date ?? c?.date_gmt ?? ''),
    link: String(c?.link ?? c?.permalink ?? ''),
    content_raw: String(c?.content_raw ?? c?.content?.raw ?? ''),
    content_rendered: String(c?.content_rendered ?? c?.content?.rendered ?? ''),
  })
  return {
    id: Number(u?.id ?? 0),
    name: u?.name ?? u?.display_name,
    slug: String(u?.slug ?? ''),
    description: u?.description ?? '',
    avatar_urls: u?.avatar_urls ?? {},
    profile_fields: u?.profile_fields ?? null,
    recent_posts: Array.isArray(u?.recent_posts) ? u.recent_posts.map(mapPost) : [],
    recent_comments: Array.isArray(u?.recent_comments) ? u.recent_comments.map(mapComment) : [],
  social: deriveSocial(u),
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
