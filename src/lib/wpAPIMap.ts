// filepath: lib/wpApiMap.ts
// Centralized mapping of Next.js API routes → WordPress REST endpoints

export const WP_BASE = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL || '';

export const apiMap = {
  auth: {
    login: `${WP_BASE}/wp-json/jwt-auth/v1/token`,
    logout: `/api/auth/logout`, // handled locally in Next.js
    me: `${WP_BASE}/wp-json/wp/v2/users/me?context=edit`,
    register: `${WP_BASE}/wp-json/fe-auth/v1/register`,
  },
  users: {
    list: `${WP_BASE}/wp-json/wp/v2/users`,
    bySlug: (slug: string) => `${WP_BASE}/wp-json/fe-auth/v1/public-user/${slug}`,
    me: `${WP_BASE}/wp-json/wp/v2/users/me`,
    avatar: (id: number) => `${WP_BASE}/wp-json/wp/v2/media/${id}`,
    create: `${WP_BASE}/wp-json/wp/v2/users`,
    update: (id: number) => `${WP_BASE}/wp-json/wp/v2/users/${id}`,
    delete: (id: number) => `${WP_BASE}/wp-json/wp/v2/users/${id}`,
  // Custom MU endpoint for bulk deletion (see docs/mu-plugins-backup/mu-fe-auth-users-bulk-delete.php)
  bulkDelete: `${WP_BASE}/wp-json/fe-auth/v1/users/bulk-delete`,
  },
  posts: {
    list: `${WP_BASE}/wp-json/wp/v2/posts`,
    create: `${WP_BASE}/wp-json/wp/v2/posts`,
    update: (id: number) => `${WP_BASE}/wp-json/wp/v2/posts/${id}`,
    delete: (id: number) => `${WP_BASE}/wp-json/wp/v2/posts/${id}`,
    revisions: (id: number) => `${WP_BASE}/wp-json/wp/v2/posts/${id}/revisions`,
    search: (q: string) => `${WP_BASE}/wp-json/wp/v2/search?search=${encodeURIComponent(q)}`,
    related: (query: string) => `${WP_BASE}/wp-json/wp/v2/posts?${query}`,
  },
  comments: {
    list: `${WP_BASE}/wp-json/wp/v2/comments`,
    create: `${WP_BASE}/wp-json/wp/v2/comments`,
    update: (id: number) => `${WP_BASE}/wp-json/wp/v2/comments/${id}`,
    delete: (id: number) => `${WP_BASE}/wp-json/wp/v2/comments/${id}`,
    bulk: `${WP_BASE}/wp-json/fe-auth/v1/comments/bulk`, // custom MU endpoint
  },
  media: {
    list: `${WP_BASE}/wp-json/wp/v2/media`,
    file: (id: number) => `${WP_BASE}/wp-json/wp/v2/media/${id}`,
    create: `${WP_BASE}/wp-json/wp/v2/media`,
    update: (id: number) => `${WP_BASE}/wp-json/wp/v2/media/${id}`,
    delete: (id: number) => `${WP_BASE}/wp-json/wp/v2/media/${id}`,
  },
  taxonomies: {
    categories: `${WP_BASE}/wp-json/wp/v2/categories`,
    tags: `${WP_BASE}/wp-json/wp/v2/tags`,
  },
  settings: {
    get: `${WP_BASE}/wp-json/wp/v2/settings`,
    update: `${WP_BASE}/wp-json/wp/v2/settings`,
  },
  plugins: {
    list: `${WP_BASE}/wp-json/wp/v2/plugins`,
    toggle: (id: string) => `${WP_BASE}/wp-json/wp/v2/plugins/${id}`,
  },
  themes: {
    list: `${WP_BASE}/wp-json/wp/v2/themes`,
  },
  siteHealth: {
    backgroundUpdates: `${WP_BASE}/wp-json/wp-site-health/v1/tests/background-updates`,
    directorySizes: `${WP_BASE}/wp-json/wp-site-health/v1/directory-sizes`,
  },
  mu: {
    trackView: `${WP_BASE}/wp-json/fe-auth/v1/track-view`,
    bookmarks: `${WP_BASE}/wp-json/fe-auth/v1/bookmarks`,
    bookmarkCheck: (postId: number) => `${WP_BASE}/wp-json/fe-auth/v1/bookmarks/check?post_id=${postId}`,
    bookmarkToggle: `${WP_BASE}/wp-json/fe-auth/v1/bookmarks/toggle`,
  },
  utilities: {
    robots: `/robots.txt`,
    sitemap: `/sitemap.xml`,
  },
  analytics: {
    check: `${WP_BASE}/wp-json/fe-analytics/v1/check`,
    views: `${WP_BASE}/wp-json/fe-analytics/v1/views`,
    devices: `${WP_BASE}/wp-json/fe-analytics/v1/devices`,
    countries: `${WP_BASE}/wp-json/fe-analytics/v1/countries`,
    cities: `${WP_BASE}/wp-json/fe-analytics/v1/cities`,
    referers: `${WP_BASE}/wp-json/fe-analytics/v1/referers`,
    topPosts: `${WP_BASE}/wp-json/fe-analytics/v1/top-posts`,
  summary: `${WP_BASE}/wp-json/fe-analytics/v1/summary`,
  sessions: `${WP_BASE}/wp-json/fe-analytics/v1/sessions`,
  sessionSummary: `${WP_BASE}/wp-json/fe-analytics/v1/sessions/summary`,
  sessionTimeseries: `${WP_BASE}/wp-json/fe-analytics/v1/sessions/timeseries`,
  stream: `${WP_BASE}/wp-json/fe-analytics/v1/stream`,
  },
};
