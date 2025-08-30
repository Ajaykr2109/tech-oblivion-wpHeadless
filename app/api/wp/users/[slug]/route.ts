export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createHmac } from 'crypto'

function toSlugish(s: string) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
}

function authHeader() {
  const user = process.env.WP_API_USER
  const appPass = process.env.WP_API_APP_PASSWORD
  if (!user || !appPass) return undefined
  const token = Buffer.from(`${user}:${appPass}`).toString('base64')
  return `Basic ${token}`
}

async function fetchJSON(url: URL, init?: RequestInit) {
  const res = await fetch(url, init)
  const text = await res.text()
  let data: any
  try { data = JSON.parse(text) } catch { data = null }
  return { res, data, text }
}

function signProxy(method: string, path: string, body: string, secret: string) {
  const ts = String(Math.floor(Date.now() / 1000))
  const base = `${method.toUpperCase()}\n${path}\n${ts}\n${body || ''}`
  const sig = createHmac('sha256', secret).update(base).digest()
  const b64 = Buffer.from(sig).toString('base64')
  return { ts, sign: b64 }
}

async function tryProxyUser(WP: string, slugOrSearch: { slug?: string; search?: string }) {
  const secret = process.env.FE_PROXY_SECRET || ''
  if (!secret) return null
  const base = WP.replace(/\/$/, '')
  const path = 'wp/v2/users'
  const url = new URL('/wp-json/fe-auth/v1/proxy', base)
  url.searchParams.set('path', path)
  // encode query object keys like query[slug]=foo
  const qKey = slugOrSearch.slug ? 'slug' : 'search'
  const qVal = (slugOrSearch.slug ?? slugOrSearch.search) as string
  url.searchParams.set(`query[${qKey}]`, qVal)

  const { ts, sign } = signProxy('GET', path, '', secret)
  const headers: HeadersInit = { 'x-fe-ts': ts, 'x-fe-sign': sign }
  const res = await fetch(url.toString(), { headers, cache: 'no-store' })
  if (!res.ok) return null
  let arr: any = null
  try { arr = await res.json() } catch { arr = null }
  if (Array.isArray(arr) && arr.length) return arr[0]
  return null
}

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const WP = process.env.WP_URL
  if (!WP) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })

  const base = WP.replace(/\/$/, '')
  const candidate = toSlugish(params.slug)
  const headers: HeadersInit = {}
  const basic = authHeader()
  if (basic) (headers as any).Authorization = basic

  // 0) Try MU proxy if configured (more reliable on locked-down sites)
  try {
    const viaSlug = await tryProxyUser(WP, { slug: candidate })
    if (viaSlug) return new Response(JSON.stringify(sanitizeUser(viaSlug)), { status: 200, headers: { 'Content-Type': 'application/json' } })
    const viaSearch = await tryProxyUser(WP, { search: params.slug })
    if (viaSearch) return new Response(JSON.stringify(sanitizeUser(viaSearch)), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch {}

  // 1) Try strict slug match
  const bySlug = new URL('/wp-json/wp/v2/users', base)
  bySlug.searchParams.set('slug', candidate)
  const a = await fetchJSON(bySlug, { headers })
  if (a.res.ok && Array.isArray(a.data) && a.data.length) {
    const u = a.data[0]
    return new Response(JSON.stringify(sanitizeUser(u)), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  // 2) Fallback search
  const bySearch = new URL('/wp-json/wp/v2/users', base)
  bySearch.searchParams.set('search', params.slug)
  const b = await fetchJSON(bySearch, { headers })
  if (!b.res.ok || !Array.isArray(b.data) || b.data.length === 0) {
    // 404 when nothing is returned, even if WP responded 200 with an empty list
    return new Response(JSON.stringify({ error: 'User not found', status: 404 }), { status: 404 })
  }
  const lower = params.slug.toLowerCase()
  const exact = b.data.find((u: any) => u?.slug?.toLowerCase() === candidate || u?.slug?.toLowerCase() === lower)
  const chosen = exact || b.data.find((u: any) => u?.name?.toLowerCase() === lower || u?.display_name?.toLowerCase() === lower) || b.data[0]
  return new Response(JSON.stringify(sanitizeUser(chosen)), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

function sanitizeUser(u: any) {
  return {
    id: u?.id,
    slug: u?.slug,
    name: u?.name ?? u?.display_name,
    display_name: u?.display_name,
    description: u?.description ?? '',
    avatar_urls: u?.avatar_urls ?? {},
    url: u?.url ?? '',
  }
}
