import { cookies } from 'next/headers'

import { verifySession } from './jwt'

export async function getServerSessionClaims() {
  const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'session'
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session?.value) return null
  try {
    return await verifySession(session.value)
  } catch {
    return null
  }
}

export async function requireAnyRoleServer(roles: string[]) {
  const claims = await getServerSessionClaims()
  if (!claims) {
    const e = new Error('Unauthorized') as Error & { status: number }
    e.status = 401
    throw e
  }
  const userRoles: string[] = (claims as { roles?: string[] }).roles || []
  if (!roles.some(r => userRoles.includes(r))) {
    const e = new Error('Forbidden') as Error & { status: number }
    e.status = 403
    throw e
  }
  return claims
}
