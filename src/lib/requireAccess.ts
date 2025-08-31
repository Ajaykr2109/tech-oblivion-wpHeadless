import { getServerSessionClaims } from '@/lib/server-session'
import checkAccess from '@/lib/checkAccess'
import { mapToApiRole } from '@/lib/rbac'
import type { AccessLevel } from '@/config/apiRolesMatrix'

export async function requireAccess(opts: { path: string; method: string; action: AccessLevel }) {
  const claims = await getServerSessionClaims()
  let roles: string[] | null = (claims as any)?.roles || null
  // Enrich roles from WordPress if we have a WP token
  if ((claims as any)?.wpToken) {
    const wp = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
    if (wp) {
      try {
        const url = new URL('/wp-json/wp/v2/users/me', wp)
        url.searchParams.set('context', 'edit')
        const res = await fetch(url, { headers: { Authorization: `Bearer ${(claims as any).wpToken}` }, cache: 'no-store' })
        if (res.ok) {
          const j: any = await res.json()
          if (Array.isArray(j?.roles) && j.roles.length) roles = j.roles
        }
      } catch {
        // ignore network errors; fall back to token roles
      }
    }
  }
  const apiRole = mapToApiRole(roles)
  const ok = checkAccess(apiRole, opts.path, opts.method, opts.action)
  if (!ok) {
    const err = new Error('Forbidden') as any
    err.status = 403
    throw err
  }
}
