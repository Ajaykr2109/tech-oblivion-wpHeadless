export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createHmac } from 'crypto'

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

function deriveSocial(u: any): { twitter: string | null; linkedin: string | null; github: string | null } {
  if (u && typeof u.social === 'object' && u.social) {
    return {
      twitter: normalizeUrl((u.social as any).twitter ?? null),
      linkedin: normalizeUrl((u.social as any).linkedin ?? null),
      github: normalizeUrl((u.social as any).github ?? null),
    }
  }
  const pf = (u && typeof u.profile_fields === 'object') ? (u.profile_fields as Record<string, unknown>) : null
  const get = (k: string) => (pf && typeof pf[k] === 'string') ? (pf[k] as string) : undefined
  const tw = (u?.twitter_url as string) || get('twitter_url') || get('twitter') || get('x')
  const ln = (u?.linkedin_url as string) || get('linkedin_url') || get('linkedin')
  const gh = (u?.github_url as string) || get('github_url') || get('github')
  return { twitter: normalizeUrl(tw || null), linkedin: normalizeUrl(ln || null), github: normalizeUrl(gh || null) }
}

function sanitize(u: any): LiteUser {
  return {
    id: Number(u?.id ?? 0),
    slug: String(u?.slug ?? u?.user_nicename ?? ''),
    name: u?.name ?? u?.display_name ?? '',
    description: u?.description ?? '',
    avatar_urls: u?.avatar_urls ?? {},
    social: deriveSocial(u),
  }
}

function chunk<T>(arr: T[], size = 100): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

// Fallback utilities for general /api/wp/users queries (search, paging, etc.)
type AnyObj = Record<string, any>
function signProxy(method: string, path: string, body: string, secret: string) {
  const ts = String(Math.floor(Date.now() / 1000))
  const base = `${method.toUpperCase()}\n${path}\n${ts}\n${body || ''}`
  const sig = createHmac('sha256', secret).update(base).digest('base64')
  return { ts, sign: sig }
}
function authHeader() {
  const user = process.env.WP_API_USER
  const appPass = process.env.WP_API_APP_PASSWORD
  if (!user || !appPass) return undefined
  const token = Buffer.from(`${user}:${appPass}`).toString('base64')
  return `Basic ${token}`
}
function sanitizeUser(u: AnyObj) {
  return {
    id: u?.id,
    slug: u?.slug,
    name: u?.name ?? u?.display_name,
    display_name: u?.display_name,
    description: u?.description ?? '',
    avatar_urls: u?.avatar_urls ?? {},
    url: u?.url ?? '',
    social: deriveSocial(u),
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

    const results: any[] = []
    await Promise.all(idChunks.map(async (group) => {
      const u = new URL('/wp-json/wp/v2/users', base)
      group.forEach(id => u.searchParams.append('include[]', String(id)))
      u.searchParams.set('per_page', String(perPage))
      u.searchParams.set('context', 'view')
      u.searchParams.set('_fields', 'id,slug,name,description,avatar_urls,social')
      const res = await fetch(u.toString(), { cache: 'no-store' })
      if (res.ok) {
        const arr = await res.json().then(x => Array.isArray(x) ? x : []).catch(() => [])
        results.push(...arr)
      }
    }))

    const map = new Map<number, any>(results.map((u: any) => [Number(u.id), u]))
    const ordered = ids.map(id => map.get(id)).filter(Boolean)
    const out = ordered.map(sanitize)
    return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  // Otherwise, preserve existing generic behavior (search, paging, etc.)
  const base = WP.replace(/\/$/, '')
  const urlIn = new URL(req.url)
  const allowed = new Set([
    'context', 'search', 'slug', 'page', 'per_page', 'include', 'exclude', 'orderby', 'order'
  ])
  const qEntries: [string, string][] = []
  urlIn.searchParams.forEach((v, k) => {
    if (allowed.has(k)) qEntries.push([k, v])
  })
  if (!qEntries.find(([k]) => k === 'context')) qEntries.push(['context', 'view'])

  const secret = process.env.FE_PROXY_SECRET || ''
  const path = 'wp/v2/users'
  let upstreamTried: string | undefined
  if (secret) {
    try {
      const proxy = new URL('/wp-json/fe-auth/v1/proxy', base)
      proxy.searchParams.set('path', path)
      for (const [k, v] of qEntries) proxy.searchParams.set(`query[${k}]`, v)
      const { ts, sign } = signProxy('GET', path, '', secret)
      const pres = await fetch(proxy.toString(), { headers: { 'x-fe-ts': ts, 'x-fe-sign': sign }, cache: 'no-store' })
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
    } catch (_) {
      // fall through
    }
  }

  const direct = new URL('/wp-json/wp/v2/users', base)
  for (const [k, v] of qEntries) direct.searchParams.set(k, v)
  const headers: HeadersInit = {}
  const basic = authHeader()
  if (basic) (headers as any).Authorization = basic
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
