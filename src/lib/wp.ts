import { logWPError } from './log'

// Centralized caching knobs
const DEFAULT_TTL = Number(process.env.WP_CACHE_TTL || 300) // seconds
const TAGS = {
  posts: 'wp:posts',
  post: (slug: string|number) => `wp:post:${slug}`,
  page: (slug: string|number) => `wp:page:${slug}`,
}

// NOTE: do not read WP_URL at module load time. Read it at runtime inside each
// function so build-time imports won't crash when envs aren't present.

export type WPPost = {
  id: number
  date: string
  slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  _embedded?: any
}

export type PostSummary = {
  id: number
  slug: string
  title: string
  excerptHtml?: string
  featuredImage?: string | null
  authorName?: string | null
  authorAvatar?: string | null
  date: string
}

export type PostDetail = {
  id: number
  slug: string
  title: string
  contentHtml: string
  featuredImage?: string | null
  date: string
}

function _rawMediaUrl(p: WPPost) {
  return p._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null
}

function proxiedMediaUrl(src: string | null | undefined) {
  if (!src) return null
  try {
    const u = new URL(src)
    // Keep path + search so we preserve filenames and query strings if any
    const WP = process.env.WP_URL ?? ''
    try {
      const wpOrigin = WP ? new URL(WP).origin : ''
      if (wpOrigin && u.origin === wpOrigin) {
        return `/api/wp/media${u.pathname}${u.search}`
      }
    } catch (e) {
      // fallthrough - treat as non-WP origin
    }
    // For remote origins (gravatar, cdn, etc.) encode full URL so the media proxy
    // can fetch the correct upstream absolute URL without leaking origins to the client.
    return `/api/wp/media/absolute/${encodeURIComponent(src)}`
  } catch (e) {
    // If it's not a valid absolute URL, leave it alone
    return src
  }
}

export async function getPosts({ page = 1, perPage = 10, search = '' } = {}) {
  const WP = process.env.WP_URL ?? ''
  if (!WP) throw new Error('WP_URL env required')

  const url = new URL('/wp-json/wp/v2/posts', WP)
  url.searchParams.set('_embed', '1')
  url.searchParams.set('page', String(page))
  url.searchParams.set('per_page', String(perPage))
  if (search) url.searchParams.set('search', search)

  const res = await fetch(url.toString(), {
    // ISR w/ tags so we can surgically revalidate from /api/revalidate
    next: { revalidate: DEFAULT_TTL, tags: [TAGS.posts] },
    // include polite headers so upstream doesn't block anonymous requests
    headers: {
      'User-Agent': 'techoblivion-proxy/1.0 (+https://techoblivion.in)',
      'Referer': WP,
      'Accept': 'application/json',
    },
  })

  if (!res.ok) {
    const body = await res.text()
    // Log upstream diagnostic for debugging (truncated body)
    logWPError('getPosts', { status: res.status, statusText: res.statusText, body: body.slice(0, 2000) })
    throw new Error(`WP posts ${res.status}: ${body}`)
  }

  const total = Number(res.headers.get('X-WP-Total') || 0)
  const totalPages = Number(res.headers.get('X-WP-TotalPages') || 0)
  let items = [] as WPPost[]
  try {
    items = (await res.json()) as WPPost[]
  } catch (e: any) {
    logWPError('getPosts-json', { statusText: String(e), body: undefined })
    throw e
  }

  return {
    items: items.map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title.rendered,
      excerptHtml: p.excerpt.rendered,
      // rewrite featured image to our media proxy so the browser never calls WP origin
      featuredImage: proxiedMediaUrl(_rawMediaUrl(p)),
      authorName: p._embedded?.author?.[0]?.name ?? null,
      // proxify author avatar too (may be gravatar or remote host)
      authorAvatar: proxiedMediaUrl(p._embedded?.author?.[0]?.avatar_urls?.['48'] ?? p._embedded?.author?.[0]?.avatar_urls?.['96'] ?? null),
      date: p.date,
    })),
    total,
    totalPages,
  }
}

export async function getPostBySlug(slug: string) {
  const WP = process.env.WP_URL ?? ''
  if (!WP) throw new Error('WP_URL env required')

  const url = new URL('/wp-json/wp/v2/posts', WP)
  url.searchParams.set('slug', slug)
  url.searchParams.set('_embed', '1')

  const res = await fetch(url.toString(), {
    next: { revalidate: DEFAULT_TTL, tags: [TAGS.posts, TAGS.post(slug)] },
    headers: { 'User-Agent': 'techoblivion-proxy/1.0 (+https://techoblivion.in)', 'Referer': WP, 'Accept': 'application/json' }
  })
  if (!res.ok) {
    const body = await res.text()
    logWPError('getPostBySlug', { status: res.status, statusText: res.statusText, body: body.slice(0, 2000) })
    throw new Error(`WP post ${res.status}: ${body}`)
  }

  let arr = [] as WPPost[]
  try {
    arr = (await res.json()) as WPPost[]
  } catch (e: any) {
    logWPError('getPostBySlug-json', { statusText: String(e), body: undefined })
    throw e
  }
  const p = arr[0]
  if (!p) return null

  return {
    id: p.id,
    slug: p.slug,
    title: p.title.rendered,
    contentHtml: p.content.rendered,
    featuredImage: proxiedMediaUrl(_rawMediaUrl(p)),
    date: p.date,
  }
}

export async function getPageContent(slug: string) {
  const WP = process.env.WP_URL ?? ''
  if (!WP) throw new Error('WP_URL env required')

  const url = new URL(`/wp-json/wp/v2/pages`, WP)
  url.searchParams.set('slug', slug)
  url.searchParams.set('_embed', '0')

  const res = await fetch(url.toString(), {
    next: { revalidate: DEFAULT_TTL, tags: [TAGS.page(slug)] },
    headers: { 'User-Agent': 'techoblivion-proxy/1.0 (+https://techoblivion.in)', 'Referer': WP, 'Accept': 'application/json' }
  })
  if (!res.ok) {
    const body = await res.text()
    logWPError('getPageContent', { status: res.status, statusText: res.statusText, body: body.slice(0, 2000) })
    throw new Error(`WP page ${res.status}: ${body}`)
  }

  let arr = [] as any[]
  try {
    arr = (await res.json()) as any[]
  } catch (e: any) {
    logWPError('getPageContent-json', { statusText: String(e), body: undefined })
    throw e
  }
  const p = arr[0]
  if (!p) return null
  return { id: p.id, slug: p.slug, contentHtml: p.content?.rendered ?? '' }
}
