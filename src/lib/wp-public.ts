export type PublicUser = {
  id: number
  name?: string
  slug: string
  description?: string
  avatar_urls?: Record<string, string>
  profile_fields?: Record<string, unknown> | null
}

export async function getUserBySlug(slug: string): Promise<PublicUser | null> {
  if (!slug) return null
  const url = typeof window !== 'undefined'
    ? new URL(`/api/wp/users/${encodeURIComponent(slug)}`, window.location.origin)
    : new URL(`/api/wp/users/${encodeURIComponent(slug)}`, (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, ''))

  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) return null
  // Endpoint returns a single object or 404
  try {
    const data = await res.json()
    if (data && typeof data === 'object' && data.slug) return data as PublicUser
  } catch {}
  return null
}
