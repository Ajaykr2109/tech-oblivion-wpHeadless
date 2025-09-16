export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { fetchWithAuth } from '@/lib/fetchWithAuth'

type LiteUser = {
  id: number
  slug: string
  name?: string
  description?: string
  avatar_urls?: Record<string, string>
  social?: { twitter: string | null; linkedin: string | null; github: string | null }
}

function normalizeUrl(u?: string | null): string | null {
  if (!u) return null
  const s = String(u).trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s}`
}

function deriveSocial(u: unknown): { twitter: string | null; linkedin: string | null; github: string | null } {
  if (u && typeof u === 'object') {
    const obj = u as Record<string, unknown>
    const social = obj.social
    if (social && typeof social === 'object') {
      const s = social as Record<string, unknown>
      return {
        twitter: normalizeUrl(typeof s.twitter === 'string' ? s.twitter : null),
        linkedin: normalizeUrl(typeof s.linkedin === 'string' ? s.linkedin : null),
        github: normalizeUrl(typeof s.github === 'string' ? s.github : null),
      }
    }
    const pf = typeof obj.profile_fields === 'object' && obj.profile_fields
      ? (obj.profile_fields as Record<string, unknown>)
      : null
    const get = (k: string) => (pf && typeof pf[k] === 'string') ? (pf[k] as string) : undefined
    const tw = (typeof obj.twitter_url === 'string' ? obj.twitter_url : undefined) || get('twitter_url') || get('twitter') || get('x')
    const ln = (typeof obj.linkedin_url === 'string' ? obj.linkedin_url : undefined) || get('linkedin_url') || get('linkedin')
    const gh = (typeof obj.github_url === 'string' ? obj.github_url : undefined) || get('github_url') || get('github')
    return { twitter: normalizeUrl(tw || null), linkedin: normalizeUrl(ln || null), github: normalizeUrl(gh || null) }
  }
  return { twitter: null, linkedin: null, github: null }
}

function sanitize(u: unknown): LiteUser {
  const obj = (u && typeof u === 'object') ? (u as Record<string, unknown>) : {}
  const idRaw = obj.id
  const slugRaw = (obj.slug ?? obj.user_nicename)
  const nameRaw = (obj.name ?? obj.display_name)
  const descRaw = obj.description
  const avatarRaw = obj.avatar_urls
  return {
    id: Number(typeof idRaw === 'number' ? idRaw : parseInt(String(idRaw ?? 0), 10) || 0),
    slug: String(typeof slugRaw === 'string' ? slugRaw : ''),
    name: typeof nameRaw === 'string' ? nameRaw : '',
    description: typeof descRaw === 'string' ? descRaw : '',
    avatar_urls: (avatarRaw && typeof avatarRaw === 'object') ? (avatarRaw as Record<string, string>) : {},
    social: deriveSocial(u),
  }
}

function chunk<T>(arr: T[], size = 100): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// Fallback utilities for general /api/wp/users queries (search, paging, etc.)
type AnyObj = Record<string, unknown>
function authHeader() {
  const user = process.env.WP_API_USER
  const appPass = process.env.WP_API_APP_PASSWORD
  if (!user || !appPass) return undefined
  const token = Buffer.from(`${user}:${appPass}`).toString('base64')
  return `Basic ${token}`
}
function sanitizeUser(u: AnyObj) {
  // Derive status from profile_fields.status when present (active|inactive), default active
  const profileFields = (u?.profile_fields && typeof u.profile_fields === 'object')
    ? (u.profile_fields as Record<string, unknown>)
    : undefined
  const statusRaw = (profileFields?.status ?? profileFields?.user_status ?? (u as AnyObj)?.status) as unknown
  const status = (typeof statusRaw === 'string' && statusRaw) ? (statusRaw === 'inactive' ? 'inactive' : 'active') : 'active'
  const roles = Array.isArray(u?.roles) ? (u?.roles as unknown[]).filter(r => typeof r === 'string') as string[] : []
  const post_count = typeof u?.post_count === 'number' ? (u.post_count as number) : undefined
  return {
    id: u?.id,
    slug: u?.slug,
    name: u?.name ?? u?.display_name,
    display_name: u?.display_name,
    email: u?.email,
    description: u?.description ?? '',
    avatar_urls: u?.avatar_urls ?? {},
    url: u?.url ?? '',
    social: deriveSocial(u),
    roles,
    profile_fields: profileFields,
    status,
    post_count,
  }
}

export async function GET(req: Request) {
  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  if (!WP) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })

  const url = new URL(req.url)
  const includeParam = url.searchParams.get('include') || ''
  const ids = includeParam
    .split(',')
    .map(s => parseInt(s, 10))
    .filter(n => Number.isFinite(n) && n > 0)

  // If include[] requested, serve minimal fast list
  if (ids.length > 0) {
    const base = WP.replace(/\/$/, '')
    const perPage = 100
    const idChunks = chunk(ids, perPage)

    const results: unknown[] = []
    await Promise.all(idChunks.map(async (group) => {
      // Build proxy URL to leverage session/Bearer auth and custom fields
      const proxy = new URL('/wp-json/fe-auth/v1/proxy', base)
      proxy.searchParams.set('path', 'wp/v2/users')
      group.forEach(id => proxy.searchParams.append('query[include[]]', String(id)))
      proxy.searchParams.set('query[per_page]', String(perPage))
      proxy.searchParams.set('query[context]', 'edit')
      proxy.searchParams.set('query[_fields]', 'id,slug,name,description,avatar_urls,roles,profile_fields,social,display_name')
      const res = await fetchWithAuth(null, proxy.toString(), { cache: 'no-store' })
      if (res.ok) {
        const arr = await res.json().then(x => Array.isArray(x) ? x : []).catch(() => [])
        results.push(...arr)
      }
    }))

    const map = new Map<number, unknown>((results as Array<Record<string, unknown>>).map((u) => [Number(u.id), u]))
    const ordered = ids.map(id => map.get(id)).filter(Boolean)
    const out = ordered.map(sanitize)
    return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  // Otherwise, preserve existing generic behavior (search, paging, etc.)
  const base = WP.replace(/\/$/, '')
  const urlIn = new URL(req.url)
  const allowed = new Set([
    'context', 'search', 'slug', 'page', 'per_page', 'include', 'exclude', 'orderby', 'order', '_fields'
  ])
  const qEntries: [string, string][] = []
  urlIn.searchParams.forEach((v, k) => {
    if (allowed.has(k)) qEntries.push([k, v])
  })
  if (!qEntries.find(([k]) => k === 'context')) qEntries.push(['context', 'edit'])
  if (!qEntries.find(([k]) => k === '_fields')) qEntries.push(['_fields', 'id,slug,name,display_name,description,avatar_urls,roles,profile_fields,social,email,url,post_count'])

  const secret = process.env.FE_PROXY_SECRET || ''
  const path = 'wp/v2/users'
  let upstreamTried: string | undefined
  if (secret) {
    try {
      const proxy = new URL('/wp-json/fe-auth/v1/proxy', base)
      proxy.searchParams.set('path', path)
      for (const [k, v] of qEntries) proxy.searchParams.set(`query[${k}]`, v)
      // Use authenticated fetch to ensure 'edit' context and private fields are accessible
      const pres = await fetchWithAuth(null, proxy.toString(), { cache: 'no-store' })
      upstreamTried = proxy.toString()
      if (pres.ok) {
        const arr = await pres.json().catch(() => null)
        const list = Array.isArray(arr) ? arr : []
        return new Response(JSON.stringify(list.map(sanitizeUser)), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Upstream-Url': upstreamTried }
        })
      }
      if ([400, 401, 404].includes(pres.status)) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Upstream-Url': upstreamTried }
        })
      }
    } catch {
      // fall through
    }
  }

  const direct = new URL('/wp-json/wp/v2/users', base)
  for (const [k, v] of qEntries) direct.searchParams.set(k, v)
  const headers: Record<string, string> = {}
  const basic = authHeader()
  if (basic) {
    headers.Authorization = basic
  }
  const dres = await fetch(direct.toString(), { headers, cache: 'no-store' })
  upstreamTried = direct.toString()
  if (!dres.ok) {
    if ([400, 401, 404].includes(dres.status)) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Upstream-Url': upstreamTried }
      })
    }
    return new Response(JSON.stringify({ error: `Upstream ${dres.status}` }), { status: 502, headers: { 'X-Upstream-Url': upstreamTried! } })
  }
  const data = await dres.json().catch(() => null)
  const list = Array.isArray(data) ? data : []
  return new Response(JSON.stringify(list.map(sanitizeUser)), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'X-Upstream-Url': upstreamTried }
  })
}
