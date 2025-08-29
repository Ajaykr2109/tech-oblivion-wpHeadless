import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { signSession } from '@/lib/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type LoginBody = { identifier: string; password: string }

export async function POST(req: NextRequest) {
  const WP = process.env.WP_URL
  const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'session'
  const SECURE_COOKIE = process.env.NODE_ENV === 'production'
  if (!WP) return new Response(JSON.stringify({ message: 'WP_URL env required' }), { status: 500 })

  let body: LoginBody
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid JSON' }), { status: 400 })
  }
  if (!body?.identifier || !body?.password) {
    return new Response(JSON.stringify({ message: 'Missing credentials' }), { status: 400 })
  }

  // Authenticate against WordPress JWT endpoint
  const tokenRes = await fetch(new URL('/wp-json/jwt-auth/v1/token', WP), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: body.identifier, password: body.password }),
  })
  if (!tokenRes.ok) {
    const msg = await tokenRes.text()
    return new Response(JSON.stringify({ message: 'Invalid credentials', detail: msg.slice(0, 500) }), { status: 401 })
  }
  const tokenData: any = await tokenRes.json()
  const wpToken: string | undefined = tokenData?.token
  if (!wpToken) {
    return new Response(JSON.stringify({ message: 'Token missing from WP response' }), { status: 502 })
  }

  // Fetch user details with roles
  const meRes = await fetch(new URL('/wp-json/wp/v2/users/me', WP), {
    headers: { Authorization: `Bearer ${wpToken}` },
    cache: 'no-store',
  })
  if (!meRes.ok) {
    const msg = await meRes.text()
    return new Response(JSON.stringify({ message: 'Failed to fetch user profile', detail: msg.slice(0, 500) }), { status: 502 })
  }
  const me: any = await meRes.json()

  const claims = {
    sub: String(me?.id ?? tokenData?.user_id ?? body.identifier),
    username: me?.slug ?? tokenData?.user_nicename ?? body.identifier,
    email: me?.email ?? tokenData?.user_email ?? '',
    roles: Array.isArray(me?.roles) ? me.roles : (Array.isArray(tokenData?.roles) ? tokenData.roles : ['subscriber']),
    displayName: me?.name ?? tokenData?.user_display_name ?? body.identifier,
    wpUserId: me?.id ?? tokenData?.user_id,
    wpToken,
  }

  let jwt: string
  try {
    jwt = await signSession(claims)
  } catch (e: any) {
    return new Response(JSON.stringify({ message: 'Failed to sign session' }), { status: 500 })
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    sameSite: 'lax',
    secure: SECURE_COOKIE,
    path: '/',
    // 7 days
    maxAge: 60 * 60 * 24 * 7,
  } as any)

  // Do NOT return wpToken to the browser
  const user = {
    id: claims.wpUserId,
    username: claims.username,
    email: claims.email,
    displayName: claims.displayName,
    roles: claims.roles,
  }

  return new Response(JSON.stringify({ user }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
