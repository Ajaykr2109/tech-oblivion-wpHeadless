// Single source of truth for API RBAC
// NOTE: Do not import Node-specific modules here; keep this file isomorphic.

export type Role =
  | 'public'
  | 'subscriber'
  | 'contributor'
  | 'author'
  | 'editor'
  | 'seo_editor'
  | 'seo_manager'
  | 'administrator'

export type AccessLevel = 'read' | 'write' | 'delete' | 'moderate'

export interface EndpointAccess {
  path: string
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  roles: Partial<Record<Role, AccessLevel[]>>
  // Optional notes for caveats like "own posts only" or "draft only"
  note?: string
}

// Helper to mark allow with specific actions for multiple roles
const allow = (
  roles: Role[],
  actions: AccessLevel[]
): Partial<Record<Role, AccessLevel[]>> => {
  return roles.reduce((acc, r) => {
    acc[r] = actions
    return acc
  }, {} as Partial<Record<Role, AccessLevel[]>>)
}

export const apiRolesMatrix: EndpointAccess[] = [
  // Auth
  {
    path: '/api/auth/login',
    method: 'POST',
    roles: allow(
      [
        'public',
        'subscriber',
        'contributor',
        'author',
        'editor',
        'seo_editor',
        'seo_manager',
        'administrator',
      ],
      ['write']
    ),
  },
  {
    path: '/api/auth/logout',
    method: 'POST',
    roles: allow(
      [
        'public',
        'subscriber',
        'contributor',
        'author',
        'editor',
        'seo_editor',
        'seo_manager',
        'administrator',
      ],
      ['write']
    ),
  },
  {
    path: '/api/auth/logout',
    method: 'GET',
    roles: allow(
      [
        'public',
        'subscriber',
        'contributor',
        'author',
        'editor',
        'seo_editor',
        'seo_manager',
        'administrator',
      ],
      ['write']
    ),
  },
  {
    path: '/api/auth/me',
    method: 'GET',
    roles: allow(
      [
        'subscriber',
        'contributor',
        'author',
        'editor',
        'seo_editor',
        'seo_manager',
        'administrator',
      ],
      ['read']
    ),
  },
  {
    path: '/api/auth/register',
    method: 'POST',
    roles: allow(
      [
        'public',
        'subscriber',
        'contributor',
        'author',
        'editor',
        'seo_editor',
        'seo_manager',
        'administrator',
      ],
      ['write']
    ),
  },

  // Users
  {
    path: '/api/wp/users',
    method: 'GET',
    roles: allow(['administrator'], ['read']),
  },
  {
    path: '/api/wp/users/[slug]',
    method: 'GET',
    roles: allow(
      [
        'public',
        'subscriber',
        'contributor',
        'author',
        'editor',
        'seo_editor',
        'seo_manager',
        'administrator',
      ],
      ['read']
    ),
  },
  {
    path: '/api/wp/users/me',
    method: 'GET',
    roles: allow(
      [
        'subscriber',
        'contributor',
        'author',
        'editor',
        'seo_editor',
        'seo_manager',
        'administrator',
      ],
      ['read']
    ),
  },
  {
    path: '/api/wp/users/avatar',
    method: 'GET',
    roles: allow(
      [
        'public',
        'subscriber',
        'contributor',
        'author',
        'editor',
        'seo_editor',
        'seo_manager',
        'administrator',
      ],
      ['read']
    ),
  },

  // Posts
  {
    path: '/api/wp/posts',
    method: 'GET',
    roles: allow(
      [
        'public',
        'subscriber',
        'contributor',
        'author',
        'editor',
        'seo_editor',
        'seo_manager',
        'administrator',
      ],
      ['read']
    ),
  },
  {
    path: '/api/wp/posts',
    method: 'POST',
    roles: {
      ...allow(['contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['write']),
    },
    note: 'Contributors: draft only; Authors: own posts',
  },
  {
  path: '/api/wp/posts',
    method: 'PATCH',
    roles: allow(['author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['write']),
  note: 'Authors: own posts only; accepts ?id= query',
  },
  {
    path: '/api/wp/posts/[id]',
    method: 'DELETE',
    roles: allow(['administrator'], ['delete']),
  },
  {
    path: '/api/wp/posts/[id]/revisions',
    method: 'GET',
    roles: allow(['editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']),
  },

  // Comments
  {
    path: '/api/wp/comments',
    method: 'GET',
    roles: allow(
      [
        'public',
        'subscriber',
        'contributor',
        'author',
        'editor',
        'seo_editor',
        'seo_manager',
        'administrator',
      ],
      ['read']
    ),
  },
  {
    path: '/api/wp/comments',
    method: 'POST',
    roles: allow(['subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['write']),
  },
  {
    path: '/api/wp/comments/[id]',
    method: 'PATCH',
    roles: allow(['editor', 'administrator'], ['moderate']),
  },
  {
    path: '/api/wp/comments/[id]',
    method: 'DELETE',
    roles: allow(['administrator'], ['delete']),
  },

  // Media
  {
    path: '/api/wp/media/list',
    method: 'GET',
    roles: allow(
      [
        'public',
        'subscriber',
        'contributor',
        'author',
        'editor',
        'seo_editor',
        'seo_manager',
        'administrator',
      ],
      ['read']
    ),
  },
  {
    path: '/api/wp/media',
    method: 'POST',
    roles: allow(['author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['write']),
  },
  {
    path: '/api/wp/media/[id]',
    method: 'PATCH',
    roles: allow(['author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['write']),
    note: 'Authors: own media only',
  },
  {
    path: '/api/wp/media/[id]',
    method: 'DELETE',
    roles: allow(['administrator'], ['delete']),
  },

  // Taxonomies (read-only)
  {
    path: '/api/wp/categories',
    method: 'GET',
    roles: allow(
      [
        'public',
        'subscriber',
        'contributor',
        'author',
        'editor',
        'seo_editor',
        'seo_manager',
        'administrator',
      ],
      ['read']
    ),
  },
  {
    path: '/api/wp/categories',
    method: 'POST',
    roles: allow(['contributor', 'author', 'editor', 'administrator'], ['write']),
  },
  {
    path: '/api/wp/tags',
    method: 'GET',
    roles: allow(
      [
        'public',
        'subscriber',
        'contributor',
        'author',
        'editor',
        'seo_editor',
        'seo_manager',
        'administrator',
      ],
      ['read']
    ),
  },
  {
    path: '/api/wp/tags',
    method: 'POST',
    roles: allow(['contributor', 'author', 'editor', 'administrator'], ['write']),
  },
  {
    path: '/api/wp/tags/resolve',
    method: 'POST',
    roles: allow(['contributor', 'author', 'editor', 'administrator'], ['write']),
  },

  // Admin / Site Settings (admin only)
  {
    path: '/api/admin',
    method: 'GET',
    roles: allow(['administrator'], ['read']),
  },
  {
    path: '/api/wp/settings',
    method: 'GET',
    roles: allow(['administrator'], ['read']),
  },
  {
    path: '/api/wp/settings',
    method: 'PATCH',
    roles: allow(['administrator'], ['write']),
  },

  // CSRF
  { path: '/api/csrf', method: 'GET', roles: allow(['public', 'subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },

  // Media cache proxy
  { path: '/api/media-cache', method: 'GET', roles: allow(['public', 'subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },
  { path: '/api/media-cache/image', method: 'GET', roles: allow(['public', 'subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },

  // Revalidate (admin only)
  { path: '/api/revalidate', method: 'POST', roles: allow(['administrator'], ['write']) },

  // Test WP (lock down by default)
  { path: '/api/test-wp', method: 'GET', roles: allow(['administrator'], ['read']) },

  // WP helpers
  { path: '/api/wp/search', method: 'GET', roles: allow(['public', 'subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },
  { path: '/api/wp/related', method: 'GET', roles: allow(['public', 'subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },
  { path: '/api/wp/popular', method: 'GET', roles: allow(['public', 'subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },
  { path: '/api/wp/media/[...slug]', method: 'GET', roles: allow(['public', 'subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },

  // User self updates
  { path: '/api/wp/users/avatar', method: 'POST', roles: allow(['subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['write']) },
  { path: '/api/wp/users/me', method: 'POST', roles: allow(['subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['write']) },
  { path: '/api/wp/users/me', method: 'PUT', roles: allow(['subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['write']) },

  // Analytics (read for editorial + SEO + admin)
  { path: '/api/analytics/check', method: 'GET', roles: allow(['editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },
  { path: '/api/analytics/countries', method: 'GET', roles: allow(['editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },
  { path: '/api/analytics/devices', method: 'GET', roles: allow(['editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },
  { path: '/api/analytics/export', method: 'GET', roles: allow(['editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },
  { path: '/api/analytics/referers', method: 'GET', roles: allow(['editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },
  { path: '/api/analytics/sessions', method: 'GET', roles: allow(['editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },
  { path: '/api/analytics/summary', method: 'GET', roles: allow(['editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },
  { path: '/api/analytics/top-posts', method: 'GET', roles: allow(['editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },
  { path: '/api/analytics/views', method: 'GET', roles: allow(['editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },

  // Plugins & Themes (admin only)
  {
    path: '/api/wp/themes',
    method: 'GET',
    roles: allow(['administrator'], ['read']),
  },
  {
    path: '/api/wp/plugins',
    method: 'GET',
    roles: allow(['administrator'], ['read']),
  },
  {
    path: '/api/wp/plugins/[id]',
    method: 'POST',
    roles: allow(['administrator'], ['write']),
    note: 'Activate/Deactivate',
  },

  // Site Health (admin only)
  {
    path: '/api/wp/site-health/background-updates',
    method: 'GET',
    roles: allow(['administrator'], ['read']),
  },
  {
    path: '/api/wp/site-health/directory-sizes',
    method: 'GET',
    roles: allow(['administrator'], ['read']),
  },

  // SEO Tools
  {
    path: '/yoast/v1/get_head',
    method: 'GET',
    roles: allow(
      [
        'public',
        'subscriber',
        'contributor',
        'author',
        'editor',
        'seo_editor',
        'seo_manager',
        'administrator',
      ],
      ['read']
    ),
  },
  {
    path: '/yoast/v1/semrush/related_keyphrases',
    method: 'GET',
    roles: allow(['seo_editor', 'seo_manager', 'administrator'], ['read']),
  },
  {
    path: '/yoast/v1/indexing/posts',
    method: 'POST',
    roles: allow(['seo_manager', 'administrator'], ['write']),
  },
  {
    path: '/google-site-kit/v1/...',
    method: 'GET',
    roles: allow(['seo_manager', 'administrator'], ['read']),
  },

  // Misc (MU)
  {
    path: '/api/wp/track-view',
    method: 'POST',
    roles: allow(['subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['write']),
  },
  {
    path: '/api/wp/bookmarks',
    method: 'GET',
    roles: allow(['subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']),
  },
  {
    path: '/api/wp/bookmarks',
    method: 'POST',
    roles: allow(['subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['write']),
  },

  // Site Utilities (public)
  { path: '/robots.txt', method: 'GET', roles: allow(['public', 'subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },
  { path: '/sitemap.xml', method: 'GET', roles: allow(['public', 'subscriber', 'contributor', 'author', 'editor', 'seo_editor', 'seo_manager', 'administrator'], ['read']) },
  // Diagnostics (lock down by default)
  { path: '/api/_debug', method: 'GET', roles: allow(['administrator'], ['read']) },
  { path: '/api/test', method: 'GET', roles: allow(['administrator'], ['read']) },
]

export default apiRolesMatrix
