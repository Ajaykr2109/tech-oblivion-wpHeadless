import logger from '@/lib/logger'

export type PublicUser = {
  id: number
  name?: string
  slug: string
  description?: string
  avatar_urls?: Record<string, string>
  profile_fields?: Record<string, unknown> | null
}

export async function getUserBySlug(slug: string): Promise<PublicUser | null> {
  if (!slug || typeof slug !== 'string' || !slug.trim()) {
    logger.error('getUserBySlug: Invalid slug provided', { slug })
    return null;
  }
  let url: URL;
  try {
    url = typeof window !== 'undefined'
      ? new URL(`/api/wp/users/${encodeURIComponent(slug)}`, window.location.origin)
      : new URL(`/api/wp/users/${encodeURIComponent(slug)}`, (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, ''));
  } catch (err) {
    logger.error('getUserBySlug: Failed to construct URL', { error: err, slug });
    return null;
  }
  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      logger.info('getUserBySlug: Fetch failed or user not found', { url: url.toString(), status: res.status });
      return null;
    }
    // Endpoint returns a single object or 404
    const data = await res.json();
    if (data && typeof data === 'object' && data.slug) return data as PublicUser;
  } catch (error) {
    logger.error('getUserBySlug: Fetch or parse error', { error, url: url?.toString() });
  }
  return null;
}
