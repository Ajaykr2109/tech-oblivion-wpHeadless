export async function getLatestByAuthor(authorId: number, excludeId?: number, perPage = 3) {
  try {
    // For server-side execution, we need to determine the correct base URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    process.env.SITE_URL || 
                    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3201')
    
    const url = new URL('/api/wp/posts', baseUrl)
    url.searchParams.set('author', String(authorId))
    url.searchParams.set('per_page', String(perPage))
    url.searchParams.set('orderby', 'meta_value_num')
    url.searchParams.set('meta_key', 'views')
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

// Function to get editor picks as fallback
export async function getEditorPicks() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    process.env.SITE_URL || 
                    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3201')
    
    const url = new URL('/api/admin/editor-picks', baseUrl)
    
    const r = await fetch(url.toString(), { 
      headers: { Accept: 'application/json' }, 
      cache: 'no-store',
      signal: AbortSignal.timeout(10000)
    })
    
    if (!r.ok) {
      console.warn(`Failed to fetch editor picks: ${r.status} ${r.statusText}`)
      return []
    }
    
    const response = await r.json().catch(() => ({ editorPicks: [] }))
    const editorPickIds = response.editorPicks || []
    
    if (editorPickIds.length === 0) return []
    
    // Fetch the actual posts for editor picks
    const postsUrl = new URL('/api/wp/posts', baseUrl)
    postsUrl.searchParams.set('include', editorPickIds.join(','))
    postsUrl.searchParams.set('per_page', '3')
    
    const postsR = await fetch(postsUrl.toString(), { 
      headers: { Accept: 'application/json' }, 
      cache: 'no-store',
      signal: AbortSignal.timeout(10000)
    })
    
    if (!postsR.ok) {
      return []
    }
    
    const posts = await postsR.json().catch(() => [])
    return Array.isArray(posts) ? posts : []
  } catch (error) {
    console.warn('Error fetching editor picks:', error)
    return []
  }
}
