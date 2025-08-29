import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function fetchAllCategories(WP: string, qs: URLSearchParams) {
  // Aggregate across all pages
  const firstUrl = new URL('/wp-json/wp/v2/categories', WP)
  qs.forEach((v, k) => firstUrl.searchParams.set(k, v))
  if (!firstUrl.searchParams.has('per_page')) firstUrl.searchParams.set('per_page', '100')
  if (!firstUrl.searchParams.has('hide_empty')) firstUrl.searchParams.set('hide_empty', '0')
  if (!firstUrl.searchParams.has('orderby')) firstUrl.searchParams.set('orderby', 'name')
  if (!firstUrl.searchParams.has('order')) firstUrl.searchParams.set('order', 'asc')
  firstUrl.searchParams.set('page', '1')

  const out: any[] = []
  let page = 1
  let totalPages = 1
  do {
    firstUrl.searchParams.set('page', String(page))
    const res = await fetch(firstUrl.toString(), { cache: 'no-store' })
    if (!res.ok) throw new Error(`Upstream ${res.status}`)
    const cur = await res.json()
    out.push(...cur)
    totalPages = Number(res.headers.get('X-WP-TotalPages') || '1')
    page += 1
  } while (page <= totalPages)
  return out
}

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })
  const url = new URL(req.url)
  try {
    const data = await fetchAllCategories(WP, url.searchParams)
    return Response.json(data, { headers: { 'Cache-Control': 'public, max-age=300' } })
  } catch (e: any) {
    return new Response(e.message || 'Upstream error', { status: 502 })
  }
}

export async function POST(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })
  const cookieStore = await cookies()
  const token = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')?.value
  if (!token) return new Response('Unauthorized', { status: 401 })
  let claims: any
  try { claims = await verifySession(token) } catch { return new Response('Unauthorized', { status: 401 }) }
  const roles: string[] = (claims.roles as any) || []
  if (!roles.some(r => ['contributor','author','editor','administrator'].includes(r))) {
    return new Response('Forbidden', { status: 403 })
  }
  const wpToken = (claims as any).wpToken
  if (!wpToken) return new Response('Missing upstream token', { status: 401 })

  const bodyText = await req.text()
  const res = await fetch(new URL('/wp-json/wp/v2/categories', WP), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${wpToken}` },
    body: bodyText,
  })
  const text = await res.text()
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}
