import { cookies } from 'next/headers'
import { verifySession } from '@/lib/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  if (!sessionCookie?.value) return new Response('Unauthorized', { status: 401 })

  let claims: any
  try { claims = await verifySession(sessionCookie.value) } catch { return new Response('Unauthorized', { status: 401 }) }
  const wpToken = claims?.wpToken
  if (!wpToken) return new Response('Unauthorized', { status: 401 })

  const url = new URL('/wp-json/wp/v2/users/me', WP)
  url.searchParams.set('context', 'edit')
  url.searchParams.set('_fields', 'id,slug,name,email,roles,avatar_urls,description,url,locale,nickname')
  const res = await fetch(url, { headers: { Authorization: `Bearer ${wpToken}` }, cache: 'no-store' })
  const text = await res.text()
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}

export async function POST(req: Request) {
  const WP = process.env.WP_URL
  if (!WP) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  if (!sessionCookie?.value) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  let claims: any
  try { claims = await verifySession(sessionCookie.value) } catch { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }) }
  const wpToken = claims?.wpToken
  if (!wpToken) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  let body: any = {}
  try { body = await req.json() } catch { body = {} }

  // Only allow a safe subset to pass through
  const allowed = ['name','nickname','email','url','description','locale']
  const patch: Record<string, any> = {}
  for (const k of allowed) if (k in body) patch[k] = body[k]

  const url = new URL('/wp-json/wp/v2/users/me', WP)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${wpToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patch),
  })

  const text = await res.text()
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}
