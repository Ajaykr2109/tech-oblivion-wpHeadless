import { cookies } from 'next/headers'
import { verifySession } from './jwt'

export type User = { id: number; username: string; email: string; roles: string[]; display_name?: string; wpUserId?: number }

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'session'

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = (await cookies()) as any
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session) return null
  try {
    const claims = await verifySession(session.value)
    const user: User = {
  id: (claims as any).wpUserId ?? (Number.isFinite(Number(claims.sub)) ? Number(claims.sub) : -1),
      username: claims.username as string,
      email: claims.email as string,
      roles: (claims.roles as string[]) || [],
      display_name: (claims as any).displayName,
      wpUserId: (claims as any).wpUserId,
    }
    return user
  } catch {
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

export async function requireAnyRole(roles: string[]) {
  const user = await getSessionUser()
  if (!user) {
    const e: any = new Error('Unauthorized')
    e.status = 401
    throw e
  }
  if (!user.roles || !roles.some(r => user.roles.includes(r))) {
    const e: any = new Error('Forbidden')
    e.status = 403
    throw e
  }
  return user
}
