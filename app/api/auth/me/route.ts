// cookies import removed (unused)
import { verifySession } from '../../../../src/lib/jwt'

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`${process.env.SESSION_COOKIE_NAME || 'session'}=([^;]+)`))
  const token = match?.[1]
  if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  try {
    const user = await verifySession(token)
    return new Response(JSON.stringify({ user }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
}
