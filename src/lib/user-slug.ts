export interface UserSlugResponse {
  slug?: string
  user_nicename?: string
}

/**
 * Get the current user's public profile slug
 */
export async function getCurrentUserSlug(): Promise<string | null> {
  try {
    const response = await fetch('/api/wp/users/me', {
      cache: 'no-store',
      credentials: 'include'
    })
    
    if (!response.ok) {
      return null
    }
    
    const data: UserSlugResponse = await response.json()
    
    // Return slug or fallback to user_nicename
    return data.slug || data.user_nicename || null
    
  } catch (error) {
    console.error('Failed to fetch user slug:', error)
    return null
  }
}
