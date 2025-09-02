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
    console.error('getUserBySlug: Invalid slug provided:', slug)
    return null;
  }
  let url: URL;
  try {
    url = typeof window !== 'undefined'
      ? new URL(`/api/wp/users/${encodeURIComponent(slug)}`, window.location.origin)
      : new URL(`/api/wp/users/${encodeURIComponent(slug)}`, (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, ''));
  } catch (err) {
    console.error('getUserBySlug: Failed to construct URL:', err, 'slug:', slug);
    return null;
  }
  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      console.warn('getUserBySlug: Fetch failed or user not found. URL:', url.toString(), 'Status:', res.status);
      return null;
    }
    // Endpoint returns a single object or 404
    const data = await res.json();
    if (data && typeof data === 'object' && data.slug) return data as PublicUser;
  } catch (error) {
    console.error('getUserBySlug: Fetch or parse error:', error, 'URL:', url?.toString());
  }
  return null;
}
