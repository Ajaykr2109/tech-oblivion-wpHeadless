// cookies import removed (unused)
import { z } from 'zod'
import { signSession } from '../../../../src/lib/jwt'
import { logWPError } from '../../../../src/lib/log'
import { wpFetch } from '../../../../src/lib/fetcher'

const schema = z.object({ identifier: z.string().min(1), password: z.string().min(1) })

export async function POST(req: Request) {
  const body = await req.json()
  const { identifier, password } = schema.parse(body)
  let data: any
  try {
    // wpFetch will throw a structured error on non-OK upstream responses
    data = await wpFetch('/wp-json/fe-auth/v1/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    })
  } catch (err: any) {
    // wpFetch already logs upstream details; surface a generic message
    logWPError('login-wpfetch-exception', { statusText: String(err), body: undefined })
    return new Response(JSON.stringify({ error: 'Unable to reach WordPress backend', details: String(err) }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }

  // wpFetch returned parsed JSON on success
  const { user } = data as { user: { id: number; username: string; email: string; roles: string[] } }

  const token = await signSession({ sub: String(user.id), username: user.username, email: user.email, roles: user.roles || [] })

  const isProd = process.env.NODE_ENV === 'production'
  const cookie = `${process.env.SESSION_COOKIE_NAME || 'session'}=${token}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax; ${isProd ? 'Secure; ' : ''}HttpOnly`
  return new Response(JSON.stringify({ user }), { status: 200, headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' } })
}
