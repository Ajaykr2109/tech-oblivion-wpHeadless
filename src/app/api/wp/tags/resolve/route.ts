import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

import { verifySession } from '@/lib/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

  let body: any
  try { body = await req.json() } catch { return new Response('Bad JSON', { status: 400 }) }
  const names: string[] = Array.isArray(body?.names) ? body.names : []
  if (!names.length) return new Response(JSON.stringify({ ids: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } })

  const ids: number[] = []
  for (const raw of names) {
    const name = String(raw).trim()
    if (!name) continue
    // Search existing tag by name
    const searchUrl = new URL('/wp-json/wp/v2/tags', WP)
    searchUrl.searchParams.set('search', name)
    searchUrl.searchParams.set('per_page', '10')
    const searchRes = await fetch(searchUrl.toString(), { cache: 'no-store' })
    let found: any = null
    if (searchRes.ok) {
      const arr = await searchRes.json()
      found = (arr || []).find((t: any) => String(t.name).toLowerCase() === name.toLowerCase())
    }
    if (found?.id) {
      ids.push(found.id)
      continue
    }
    // Create if missing
    const createRes = await fetch(new URL('/wp-json/wp/v2/tags', WP), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${wpToken}` },
      body: JSON.stringify({ name }),
    })
    if (!createRes.ok) {
      // Skip silently, or collect error? We'll skip to not block entire request.
      continue
    }
    const created = await createRes.json()
    if (created?.id) ids.push(created.id)
  }

  return new Response(JSON.stringify({ ids }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
