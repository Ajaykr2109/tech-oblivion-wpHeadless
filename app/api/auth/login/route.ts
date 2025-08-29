import { cookies } from 'next/headers'
import { z } from 'zod'
import { signSession } from '../../../../src/lib/jwt'
import { logWPError } from '../../../../src/lib/log'

const schema = z.object({ identifier: z.string().min(1), password: z.string().min(1) })

export async function POST(req: Request) {
  const body = await req.json()
  const { identifier, password } = schema.parse(body)
  let r: Response
  try {
    r = await fetch(`${process.env.WP_URL}/wp-json/fe-auth/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })
  } catch (err: any) {
    logWPError('login-fetch', { statusText: String(err), body: String(err).slice(0, 2000) })
    return new Response(JSON.stringify({ error: 'Unable to reach WordPress backend', details: String(err) }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }

  const ct = r.headers.get('content-type') || ''
  let data: any = null
  if (ct.includes('application/json')) {
    try {
      data = await r.json()
    } catch (err: any) {
      const text = await r.text().catch(() => '')
      logWPError('login-invalid-json', { status: r.status, statusText: String(err), body: text.slice(0, 2000) })
      return new Response(JSON.stringify({ error: 'Invalid JSON response from WordPress', details: String(err) }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    }
  } else {
    // WordPress returned HTML or plain text (likely an error page). Read text for diagnostics.
    const text = await r.text()
    if (!r.ok) {
      logWPError('login-wp-error', { status: r.status, statusText: r.statusText, body: text.slice(0, 2000) })
      return new Response(JSON.stringify({ error: 'WordPress error', statusText: r.statusText, body: text.slice(0, 1000) }), { status: r.status, headers: { 'Content-Type': 'application/json' } })
    }
    // Unexpected non-JSON success response
    return new Response(JSON.stringify({ error: 'Unexpected non-JSON response from WordPress', body: text.slice(0, 1000) }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }

  if (!r.ok) {
    return new Response(JSON.stringify({ error: data?.message || 'Login failed', details: data }), { status: r.status, headers: { 'Content-Type': 'application/json' } })
  }

  const { user } = data as { user: { id: number; username: string; email: string; roles: string[] } }

  const token = await signSession({ sub: String(user.id), username: user.username, email: user.email, roles: user.roles || [] })

  const isProd = process.env.NODE_ENV === 'production'
  const cookie = `${process.env.SESSION_COOKIE_NAME || 'session'}=${token}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax; ${isProd ? 'Secure; ' : ''}HttpOnly`
  return new Response(JSON.stringify({ user }), { status: 200, headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' } })
}
