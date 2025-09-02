import { cookies } from 'next/headers'

import { logAuthAttempt } from '../../app/api/logs/route'

import { verifySession } from './jwt'


export type User = {
  id: number
  username: string
  email: string
  roles: string[]
  display_name?: string
  wpUserId?: number
  // New canonical container from FE Auth Bridge plugin
  profile_fields?: Record<string, string>
  // Legacy: keep meta for backward compat; callers should prefer profile_fields
  meta?: Record<string, string>
}

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'session'

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session) return null
  try {
    const claims = await verifySession(session.value) as {
      wpUserId?: number
      sub?: string
      username: string
      email: string
      roles?: string[]
      displayName?: string
    }
    const user: User = {
      id: claims.wpUserId ?? (Number.isFinite(Number(claims.sub)) ? Number(claims.sub) : -1),
      username: claims.username,
      email: claims.email,
      roles: claims.roles || [],
      display_name: claims.displayName,
      wpUserId: claims.wpUserId,
    }
    return user
  } catch {
    return null
  }
}

export async function requireRole(role: string) {
  const user = await getSessionUser()
  if (!user) {
    const e = new Error('Unauthorized') as Error & { status: number }
    e.status = 401
    logAuthAttempt('anonymous', 'guest', `requireRole:${role}`, 'denied', { reason: 'no_session' })
    throw e
  }
  if (!user.roles || !user.roles.includes(role)) {
    const e = new Error('Forbidden') as Error & { status: number }
    e.status = 403
    logAuthAttempt(user.id, user.roles.join(','), `requireRole:${role}`, 'denied', { required: role, has: user.roles })
    throw e
  }
  logAuthAttempt(user.id, user.roles.join(','), `requireRole:${role}`, 'allowed')
  return user
}

export async function requireAnyRole(roles: string[]) {
  const user = await getSessionUser()
  if (!user) {
    const e = new Error('Unauthorized') as Error & { status: number }
    e.status = 401
    logAuthAttempt('anonymous', 'guest', `requireAnyRole:${roles.join(',')}`, 'denied', { reason: 'no_session' })
    throw e
  }
  if (!user.roles || !roles.some(r => user.roles.includes(r))) {
    const e = new Error('Forbidden') as Error & { status: number }
    e.status = 403
    logAuthAttempt(user.id, user.roles.join(','), `requireAnyRole:${roles.join(',')}`, 'denied', { required: roles, has: user.roles })
    throw e
  }
  logAuthAttempt(user.id, user.roles.join(','), `requireAnyRole:${roles.join(',')}`, 'allowed')
  return user
}
