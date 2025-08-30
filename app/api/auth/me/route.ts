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
        url.searchParams.set('_fields', 'id,slug,name,email,roles,avatar_urls,description,url,locale,nickname,acf')
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
          if (wp?.acf) user.acf = wp.acf
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
    // Normalize socials from ACF if present; include website fallback
    if (user.acf && typeof user.acf === 'object') {
      const a = user.acf as any
      const socials: Record<string, string> = {}
      const set = (k: string, v?: string) => { if (v && typeof v === 'string' && v.trim()) socials[k] = v.trim() }
      set('twitter', a.twitter || a.x || a.twitter_url)
      set('github', a.github || a.github_url)
      set('linkedin', a.linkedin || a.linkedin_url)
      set('instagram', a.instagram || a.instagram_url)
      set('facebook', a.facebook || a.facebook_url)
      set('youtube', a.youtube || a.youtube_url)
      set('tiktok', a.tiktok || a.tiktok_url)
      set('mastodon', a.mastodon || a.mastodon_url)
      set('bluesky', a.bluesky || a.bluesky_url)
      set('website', a.website || a.site || user.url)
      if (Object.keys(socials).length) user.socials = socials
    } else if (user.url) {
      user.socials = { website: user.url }
    }
    return new Response(JSON.stringify({ user }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
}
