import { cookies } from 'next/headers'
import { z } from 'zod'
import { signSession } from '../../../../src/lib/jwt'

const schema = z.object({ identifier: z.string().min(1), password: z.string().min(1) })

export async function POST(req: Request) {
  const body = await req.json()
  const { identifier, password } = schema.parse(body)

  const r = await fetch(`${process.env.WP_URL}/wp-json/fe-auth/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  })

  const data = await r.json()
  if (!r.ok) {
    return new Response(JSON.stringify({ error: data?.message || 'Login failed' }), { status: r.status })
  }

  const { user } = data as { user: { id: number; username: string; email: string; roles: string[] } }

  const token = await signSession({ sub: String(user.id), username: user.username, email: user.email, roles: user.roles || [] })

  const isProd = process.env.NODE_ENV === 'production'
  const cookie = `${process.env.SESSION_COOKIE_NAME || 'session'}=${token}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax; ${isProd ? 'Secure; ' : ''}HttpOnly`
  return new Response(JSON.stringify({ user }), { status: 200, headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' } })
}
