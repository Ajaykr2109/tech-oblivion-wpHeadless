export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type PublicUser = {
  id: number
  name?: string
  slug: string
  description?: string
  avatar_urls?: Record<string, string>
  profile_fields?: Record<string, unknown> | null
  recent_posts?: Array<{
    id: number;
    title: string;
    slug: string;
    date: string;
    link: string;
    content_raw: string;
    content_rendered: string;
  }>
  recent_comments?: Array<{
    id: number;
    post: number;
    date: string;
    link: string;
    content_raw: string;
    content_rendered: string;
  }>
  social?: { twitter: string | null; linkedin: string | null; github: string | null }
}

function normalizeUrl(u?: string | null): string | null {
  if (!u) return null
  const s = String(u).trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s}`
}

function deriveSocial(u: Record<string, unknown>): { twitter: string | null; linkedin: string | null; github: string | null } {
  // Prefer explicit social object if backend/plugin supplies it
  if (u && typeof u.social === 'object' && u.social) {
    const social = u.social as Record<string, unknown>
    return {
      twitter: normalizeUrl(typeof social.twitter === 'string' ? social.twitter : null),
      linkedin: normalizeUrl(typeof social.linkedin === 'string' ? social.linkedin : null),
      github: normalizeUrl(typeof social.github === 'string' ? social.github : null),
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

function sanitize(u: Record<string, unknown>): PublicUser {
  const mapPost = (p: Record<string, unknown>) => ({
    id: Number(p?.id ?? 0),
    title: String(p?.title ?? (p?.title as Record<string, unknown>)?.rendered ?? ''),
    slug: String(p?.slug ?? ''),
    date: String(p?.date ?? p?.date_gmt ?? ''),
    link: String(p?.link ?? ''),
    content_raw: String(p?.content_raw ?? (p?.content as Record<string, unknown>)?.raw ?? ''),
    content_rendered: String(p?.content_rendered ?? (p?.content as Record<string, unknown>)?.rendered ?? ''),
  })
  const mapComment = (c: Record<string, unknown>) => ({
    id: Number(c?.id ?? 0),
    post: Number(c?.post ?? c?.post_id ?? 0),
    date: String(c?.date ?? c?.date_gmt ?? ''),
    link: String(c?.link ?? c?.permalink ?? ''),
    content_raw: String(c?.content_raw ?? (c?.content as Record<string, unknown>)?.raw ?? ''),
    content_rendered: String(c?.content_rendered ?? (c?.content as Record<string, unknown>)?.rendered ?? ''),
  })
  return {
    id: Number(u?.id ?? 0),
    name: typeof u?.name === 'string' ? u.name : typeof u?.display_name === 'string' ? u.display_name : undefined,
    slug: String(u?.slug ?? ''),
    description: typeof u?.description === 'string' ? u.description : '',
    avatar_urls: (u?.avatar_urls && typeof u.avatar_urls === 'object') ? u.avatar_urls as Record<string, string> : {},
    profile_fields: (u?.profile_fields && typeof u.profile_fields === 'object') ? u.profile_fields as Record<string, unknown> : null,
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
  // forward optional compact flag
  const inUrl = new URL(request.url)
  const compact = inUrl.searchParams.get('compact')
  if (compact != null) url.searchParams.set('compact', compact)

  const revalidate = Number(process.env.PROFILE_CACHE_SECONDS || '0')
  const fetchOpts: RequestInit = revalidate > 0
    ? { next: { revalidate } }
    : { cache: 'no-store' }

  try {
    const res = await fetch(url.toString(), fetchOpts)
    if (res.status === 404) {
      return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    if (!res.ok) {
      // Mask upstream errors
      return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    const data = await res.json().catch(() => null) as Record<string, unknown> | null
    if (!data || typeof data !== 'object') {
      return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    const out = sanitize(data)
    if (!out.slug) {
      return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
  }
}
