export type WordPressUser = {
  id: number
  slug: string
  name?: string
  display_name?: string
  description?: string
  avatar_urls?: Record<string, string>
  url?: string
}

function getSiteOrigin() {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''
  return String(site).replace(/\/$/, '') || 'http://localhost:3000'
}

export async function getUsers(params?: Record<string, string | number | boolean>): Promise<WordPressUser[]> {
  const origin = getSiteOrigin()
  const url = new URL('/api/wp/users', origin)
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
  }
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json().catch(() => null)
  return Array.isArray(data) ? data : []
}

export async function getUserBySlug(slug: string): Promise<WordPressUser | null> {
  const list = await getUsers({ slug })
  return list[0] || null
}
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
  categories?: number[]
  tags?: number[]
  author?: number
  _embedded?: {
    'wp:featuredmedia'?: Array<{ source_url?: string }>
    author?: Array<{ 
      name?: string
      slug?: string
      avatar_urls?: Record<string, string>
    }>
    'wp:term'?: unknown[]
  }
  // ACF or custom meta could surface under 'acf' or via meta fields
  acf?: Record<string, unknown>
  meta?: Record<string, unknown>
}

export type PostSummary = {
  id: number
  slug: string
  title: string
  excerptHtml?: string
  featuredImage?: string | null
  authorId?: number | null
  authorName?: string | null
  authorAvatar?: string | null
  authorSlug?: string | null
  date: string
}

export type PostDetail = {
  id: number
  slug: string
  title: string
  contentHtml: string
  featuredImage?: string | null
  date: string
  authorId?: number | null
  authorName?: string | null
  authorAvatar?: string | null
  authorSlug?: string | null
  categories?: { id: number; name?: string; slug?: string }[]
  tags?: { id: number; name?: string; slug?: string }[]
  seo?: {
    title?: string
    description?: string
    canonical?: string
    ogImage?: string
    twitterImage?: string
    schemaType?: string
  }
}

function _rawMediaUrl(p: WPPost) {
  return p._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null
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
  } catch (e: unknown) {
    logWPError('getPosts-json', { statusText: String(e), body: undefined })
    throw e
  }

  const itemsMapped = items.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title.rendered,
      excerptHtml: p.excerpt.rendered,
      // Direct WP media URL for stability
      featuredImage: _rawMediaUrl(p),
      authorId: p.author ?? null,
      authorName: p._embedded?.author?.[0]?.name ?? null,
      authorAvatar: p._embedded?.author?.[0]?.avatar_urls?.['48'] ?? p._embedded?.author?.[0]?.avatar_urls?.['96'] ?? null,
  authorSlug: p._embedded?.author?.[0]?.slug ?? null,
      date: p.date,
    }))
  return { items: itemsMapped, total, totalPages }
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
  } catch (e: unknown) {
    logWPError('getPostBySlug-json', { statusText: String(e), body: undefined })
    throw e
  }
  const p = arr[0]
  if (!p) return null

  const categories: { id: number; name?: string; slug?: string }[] = []
  const tags: { id: number; name?: string; slug?: string }[] = []
  // Collect taxonomy IDs if present
  const catIds: number[] = p.categories || []
  const tagIds: number[] = p.tags || []
  // Try to enrich from _embedded terms if available
  const embeddedTerms: unknown[] = p._embedded?.['wp:term'] || []
  const flatTerms = embeddedTerms.flat?.() || []
  
  type WPTerm = {
    id: number
    taxonomy: string
    name?: string
    slug?: string
  }
  
  for (const t of flatTerms) {
    const term = t as WPTerm
    if (term.taxonomy === 'category' && catIds.includes(term.id)) {
      categories.push({ id: term.id, name: term.name, slug: term.slug })
    }
    if (term.taxonomy === 'post_tag' && tagIds.includes(term.id)) {
      tags.push({ id: term.id, name: term.name, slug: term.slug })
    }
  }

  // Extract SEO from ACF or meta namespaces if present
  const metaSource = p.acf || p.meta || {}
  const meta = metaSource as Record<string, unknown>
  const seo = {
    title: typeof meta.seo_title === 'string' ? meta.seo_title : undefined,
    description: typeof meta.seo_description === 'string' ? meta.seo_description : undefined,
    canonical: typeof meta.seo_canonical === 'string' ? meta.seo_canonical : undefined,
    ogImage: typeof meta.seo_og_image === 'string' ? meta.seo_og_image : undefined,
    twitterImage: typeof meta.seo_twitter_image === 'string' ? meta.seo_twitter_image : undefined,
    schemaType: typeof meta.seo_schema_type === 'string' ? meta.seo_schema_type : undefined,
  }

  const featuredImage = _rawMediaUrl(p)
  return {
    id: p.id,
    slug: p.slug,
    title: p.title.rendered,
    contentHtml: p.content.rendered,
    featuredImage,
    date: p.date,
    authorId: p.author ?? null,
  authorName: p._embedded?.author?.[0]?.name ?? null,
  authorAvatar: p._embedded?.author?.[0]?.avatar_urls?.['48'] ?? p._embedded?.author?.[0]?.avatar_urls?.['96'] ?? null,
  authorSlug: p._embedded?.author?.[0]?.slug ?? null,
    categories,
    tags,
    seo,
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

  let arr = [] as Array<{ id: number; slug: string; content?: { rendered: string } }>
  try {
    arr = (await res.json()) as Array<{ id: number; slug: string; content?: { rendered: string } }>
  } catch (e: unknown) {
    logWPError('getPageContent-json', { statusText: String(e), body: undefined })
    throw e
  }
  const p = arr[0]
  if (!p) return null
  return { id: p.id, slug: p.slug, contentHtml: p.content?.rendered ?? '' }
}
