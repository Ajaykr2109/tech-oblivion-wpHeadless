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

  const res = await fetch(new URL('/wp-json/wp/v2/users/me', WP), { headers: { Authorization: `Bearer ${wpToken}` }, cache: 'no-store' })
  const text = await res.text()
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}
