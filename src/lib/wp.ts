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
  _embedded?: any
  // ACF or custom meta could surface under 'acf' or via meta fields
  acf?: Record<string, any>
  meta?: Record<string, any>
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

async function cachedMediaUrl(src: string | null | undefined) {
  if (!src) return null
  try {
    const u = new URL(src)
    // Prefer permanent on-disk cache served from /public/media-cache
    // Do not expose upstream origins to the client.
    const endpoint = new URL('/api/media-cache', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    endpoint.searchParams.set('url', src)
    // Call internal route server-side
    const res = await fetch(endpoint.toString(), { cache: 'no-store' })
    if (res.ok) {
      const json = await res.json()
      if (json?.url) return json.url as string
    }
    // Fallback: return direct url (last resort if internal route fails)
    return src
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

  const itemsMapped = await Promise.all(items.map(async (p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title.rendered,
      excerptHtml: p.excerpt.rendered,
      featuredImage: await cachedMediaUrl(_rawMediaUrl(p)),
      authorName: p._embedded?.author?.[0]?.name ?? null,
      authorAvatar: await cachedMediaUrl(p._embedded?.author?.[0]?.avatar_urls?.['48'] ?? p._embedded?.author?.[0]?.avatar_urls?.['96'] ?? null),
      date: p.date,
    })))
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
  } catch (e: any) {
    logWPError('getPostBySlug-json', { statusText: String(e), body: undefined })
    throw e
  }
  const p = arr[0]
  if (!p) return null

  const categories: { id: number; name?: string; slug?: string }[] = []
  const tags: { id: number; name?: string; slug?: string }[] = []
  // Collect taxonomy IDs if present
  const catIds: number[] = (p as any).categories || []
  const tagIds: number[] = (p as any).tags || []
  // Try to enrich from _embedded terms if available
  const embeddedTerms: any[] = p._embedded?.['wp:term'] || []
  const flatTerms = embeddedTerms.flat?.() || []
  for (const t of flatTerms) {
    if (t.taxonomy === 'category' && catIds.includes(t.id)) categories.push({ id: t.id, name: t.name, slug: t.slug })
    if (t.taxonomy === 'post_tag' && tagIds.includes(t.id)) tags.push({ id: t.id, name: t.name, slug: t.slug })
  }

  // Extract SEO from ACF or meta namespaces if present
  const metaSource = (p as any).acf || (p as any).meta || {}
  const seo = {
    title: metaSource.seo_title || undefined,
    description: metaSource.seo_description || undefined,
    canonical: metaSource.seo_canonical || undefined,
    ogImage: metaSource.seo_og_image || undefined,
    twitterImage: metaSource.seo_twitter_image || undefined,
    schemaType: metaSource.seo_schema_type || undefined,
  }

  const featuredImage = await cachedMediaUrl(_rawMediaUrl(p))
  return {
    id: p.id,
    slug: p.slug,
    title: p.title.rendered,
    contentHtml: p.content.rendered,
    featuredImage,
    date: p.date,
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
