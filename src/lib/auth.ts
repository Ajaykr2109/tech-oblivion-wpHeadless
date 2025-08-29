import { cookies, headers } from 'next/headers'
import { wpFetch } from './fetcher'

export type User = { id: number; username: string; email: string; roles: string[]; display_name?: string }

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'session'

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = (await cookies()) as any
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session) return null

  // Proxy to WP with cookie
  const cookieHeader = `${SESSION_COOKIE}=${session.value}`
  try {
    const data = await wpFetch<{ user: User }>(`/wp-json/fe-auth/v1/me`, { cookie: cookieHeader })
    return (data as any).user ?? data as unknown as User
  } catch (err) {
    return null
  }
}

export async function requireRole(role: string) {
  const user = await getSessionUser()
  if (!user) {
    const e: any = new Error('Unauthorized')
    e.status = 401
    throw e
  }
  if (!user.roles || !user.roles.includes(role)) {
    const e: any = new Error('Forbidden')
    e.status = 403
    throw e
  }
  return user
}
