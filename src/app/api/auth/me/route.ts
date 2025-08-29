import { cookies } from 'next/headers'
import { verifySession } from '@/lib/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'session'
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session?.value) return new Response(JSON.stringify({ user: null }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  try {
    const claims = await verifySession(session.value)
    const user = {
      id: (claims as any).wpUserId ?? claims.sub,
      username: claims.username,
      email: claims.email,
      displayName: (claims as any).displayName ?? claims.username,
      roles: (claims as any).roles ?? [],
    }
    return new Response(JSON.stringify({ user }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response(JSON.stringify({ user: null }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
}
