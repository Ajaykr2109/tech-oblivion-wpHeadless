export async function getLatestByAuthor(authorId: number, excludeId?: number, perPage = 3) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || ''
  const url = new URL('/api/wp/posts', origin || 'http://localhost')
  url.searchParams.set('author', String(authorId))
  url.searchParams.set('per_page', String(perPage))
  url.searchParams.set('orderby', 'date')
  url.searchParams.set('order', 'desc')
  if (excludeId) url.searchParams.set('exclude', String(excludeId))
  const r = await fetch(url.toString(), { headers: { Accept: 'application/json' }, cache: 'no-store' })
  if (!r.ok) return []
  const j = await r.json().catch(() => [])
  return Array.isArray(j) ? j : []
}
