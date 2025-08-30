export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { createHmac } from 'crypto'

type AnyObj = Record<string, any>

function sanitizeUser(u: AnyObj) {
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

export async function GET(request: Request) {
  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  if (!WP) return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } })
  const base = WP.replace(/\/$/, '')
  const urlIn = new URL(request.url)

  // Collect and forward whitelisted query params
  const allowed = new Set([
    'context', 'search', 'slug', 'page', 'per_page', 'include', 'exclude', 'orderby', 'order'
  ])
  const qEntries: [string, string][] = []
  urlIn.searchParams.forEach((v, k) => {
    if (allowed.has(k)) qEntries.push([k, v])
  })
  if (!qEntries.find(([k]) => k === 'context')) qEntries.push(['context', 'view'])

  // 1) Try FE Auth Bridge proxy (if configured)
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
      // 404/400/401 -> treat as empty to avoid breaking public UIs
      if ([400, 401, 404].includes(pres.status)) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Upstream-Url': upstreamTried }
        })
      }
    } catch (e) {
      // fall through to direct REST
    }
  }

  // 2) Fallback to direct WP REST API (may be restricted publicly)
  const direct = new URL('/wp-json/wp/v2/users', base)
  for (const [k, v] of qEntries) direct.searchParams.set(k, v)
  const headers: HeadersInit = {}
  const basic = authHeader()
  if (basic) (headers as any).Authorization = basic
  const dres = await fetch(direct.toString(), { headers, cache: 'no-store' })
  upstreamTried = direct.toString()
  if (!dres.ok) {
    // 404/400/401 -> []
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
