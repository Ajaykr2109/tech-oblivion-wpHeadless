import type { User } from '@/lib/auth'

export interface Post {
  id: number
  author_id?: number
  author?: {
    id: number
    slug?: string
  }
}

/**
 * Check if user can edit a specific post
 * Based on API Role Matrix: Author (own posts) | Editor+ (all posts)
 */
export function canEditPost(user: User | null, post: Post): boolean {
  if (!user) return false
  
  const roles = user.roles || []
  
  // Admin can edit all posts
  if (roles.includes('administrator')) return true
  
  // Editor can edit all posts
  if (roles.includes('editor')) return true
  
  // SEO roles can edit all posts
  if (roles.includes('seo_editor') || roles.includes('seo_manager')) return true
  
  // Author can edit own posts only
  if (roles.includes('author')) {
    const authorId = post.author_id || post.author?.id
    const userId = user.wpUserId || user.id
    return authorId === userId
  }
  
  return false
}

/**
 * Check if user can delete a specific post
 * Based on API Role Matrix: Administrator only
 */
export function canDeletePost(user: User | null, _post: Post): boolean {
  if (!user) return false
  return user.roles?.includes('administrator') || false
}

/**
 * Check if user can create posts
 * Based on API Role Matrix: Contributor+ can create
 */
export function canCreatePost(user: User | null): boolean {
  if (!user) return false
  
  const roles = user.roles || []
  const allowedRoles = ['contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator']
  
  return allowedRoles.some(role => roles.includes(role))
}

/**
 * Check if user can upload media
 * Based on API Role Matrix: Author+ can upload
 */
export function canUploadMedia(user: User | null): boolean {
  if (!user) return false
  
  const roles = user.roles || []
  const allowedRoles = ['author', 'editor', 'seo_editor', 'seo_manager', 'administrator']
  
  return allowedRoles.some(role => roles.includes(role))
}

/**
 * Check if user can moderate comments
 * Based on API Role Matrix: Editor+ can moderate
 */
export function canModerateComments(user: User | null): boolean {
  if (!user) return false
  
  const roles = user.roles || []
  const allowedRoles = ['editor', 'administrator']
  
  return allowedRoles.some(role => roles.includes(role))
}

/**
 * Helper to check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return Boolean(user?.roles?.includes('administrator'))
}

/**
 * Helper to check if user has editor-level access
 */
export function isEditor(user: User | null): boolean {
  if (!user) return false
  const roles = user.roles || []
  return roles.includes('editor') || roles.includes('administrator')
}

/**
 * Helper to check if user has author-level access
 */
export function isAuthor(user: User | null): boolean {
  if (!user) return false
  const roles = user.roles || []
  return roles.includes('author') || roles.includes('editor') || roles.includes('administrator')
}

/**
 * Get minimum role required for editor access
 */
export function getMinimumEditorRole(): string[] {
  return ['contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator']
}
