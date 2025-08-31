import { getServerSessionClaims } from '@/lib/server-session'
import checkAccess from '@/lib/checkAccess'
import { mapToApiRole } from '@/lib/rbac'
import type { AccessLevel } from '@/config/apiRolesMatrix'

export async function requireAccess(opts: { path: string; method: string; action: AccessLevel }) {
  const claims = await getServerSessionClaims()
  const roles: string[] | null = (claims as any)?.roles || null
  const apiRole = mapToApiRole(roles)
  const ok = checkAccess(apiRole, opts.path, opts.method, opts.action)
  if (!ok) {
    const err = new Error('Forbidden') as any
    err.status = 403
    throw err
  }
}
