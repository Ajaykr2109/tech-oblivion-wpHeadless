export async function getLatestByAuthor(authorId: number, excludeId?: number, perPage = 3) {
  try {
    // For server-side execution, we need to determine the correct base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    process.env.SITE_URL || 
                    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3201')
    
    const url = new URL('/api/wp/posts', baseUrl)
    url.searchParams.set('author', String(authorId))
    url.searchParams.set('per_page', String(perPage))
    url.searchParams.set('orderby', 'date')
    url.searchParams.set('order', 'desc')
    if (excludeId) url.searchParams.set('exclude', String(excludeId))
    
    const r = await fetch(url.toString(), { 
      headers: { Accept: 'application/json' }, 
      cache: 'no-store',
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000)
    })
    
    if (!r.ok) {
      console.warn(`Failed to fetch author posts: ${r.status} ${r.statusText}`)
      return []
    }
    
    const j = await r.json().catch(() => [])
    return Array.isArray(j) ? j : []
  } catch (error) {
    console.warn('Error fetching author posts:', error)
    return []
  }
}
