import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'session'
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 } as any)
  return new Response(null, { status: 204 })
}
