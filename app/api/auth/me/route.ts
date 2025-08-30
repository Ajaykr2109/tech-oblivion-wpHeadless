// cookies import removed (unused)
import { verifySession } from '../../../../src/lib/jwt'
import { createHash } from 'crypto'

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`${process.env.SESSION_COOKIE_NAME || 'session'}=([^;]+)`))
  const token = match?.[1]
  if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  try {
    const claims = await verifySession(token) as any
  const user: any = {
      id: claims.wpUserId ?? claims.sub,
      username: claims.username,
      email: claims.email,
      displayName: claims.displayName ?? claims.username,
      roles: Array.isArray(claims.roles) ? claims.roles : [],
    }
    // Enrich with live WP profile data (avatar, url, description, updated roles) when possible
    const WP = process.env.WP_URL
    const wpToken = claims.wpToken
    if (WP && wpToken) {
      try {
        const url = new URL('/wp-json/wp/v2/users/me', WP)
        url.searchParams.set('context', 'edit')
  // Ask WP for profile_fields (plugin) along with core profile fields
  url.searchParams.set('_fields', 'id,slug,name,email,roles,avatar_urls,description,url,locale,nickname,profile_fields,meta')
        const res = await fetch(url, { headers: { Authorization: `Bearer ${wpToken}` }, cache: 'no-store' })
        if (res.ok) {
          const wp = await res.json()
          if (wp?.roles) user.roles = wp.roles
          if (wp?.email) user.email = wp.email
          if (wp?.name) user.displayName = wp.name
          if (wp?.avatar_urls) user.avatar_urls = wp.avatar_urls
          if (wp?.url) user.url = wp.url
          if (wp?.description) user.description = wp.description
          if (wp?.nickname) user.nickname = wp.nickname
          if (wp?.locale) user.locale = wp.locale
          // Prefer profile_fields; keep meta for legacy UIs
          if (wp?.profile_fields && typeof wp.profile_fields === 'object') user.profile_fields = wp.profile_fields
          if (wp?.meta && typeof wp.meta === 'object') user.meta = wp.meta
        }
      } catch {
        // ignore enrichment failures; return base user
      }
    }
    // Compute gravatar fallback if avatar not present but email exists
    if (!user.avatar_urls && user.email) {
      const md5 = createHash('md5').update(String(user.email).trim().toLowerCase()).digest('hex')
      const g = (s: number) => `https://secure.gravatar.com/avatar/${md5}?s=${s}&d=identicon`
      user.avatar_urls = { '24': g(24), '48': g(48), '96': g(96), '128': g(128) }
    }
  // Do not synthesize socials anymore; FE derives from user.profile_fields (or meta fallback). Provide website fallback separately.
  if (user.url) user.website = user.url
    return new Response(JSON.stringify({ user }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
}
