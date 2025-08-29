import { logWPError } from './log'

const WP = process.env.WP_URL!

export type WPPost = {
  id: number
  date: string
  slug: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  _embedded?: any
}

function mediaUrl(p: WPPost) {
  return p._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null
}

export async function getPosts({ page = 1, perPage = 10, search = '' } = {}) {
  const url = new URL(`${WP}/wp-json/wp/v2/posts`)
  url.searchParams.set('_embed', '1')
  url.searchParams.set('page', String(page))
  url.searchParams.set('per_page', String(perPage))
  if (search) url.searchParams.set('search', search)

  const res = await fetch(url.toString(), {
    // ISR: revalidate list every 60s (tweak as you like)
    next: { revalidate: 60 },
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
      featuredImage: mediaUrl(p),
      date: p.date,
    })),
    total,
    totalPages,
  }
}

export async function getPostBySlug(slug: string) {
  const url = `${WP}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1`
  const res = await fetch(url, { next: { revalidate: 60 } })
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
    featuredImage: mediaUrl(p),
    date: p.date,
  }
}
