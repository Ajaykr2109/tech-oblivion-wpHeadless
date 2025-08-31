import type { Role } from '@/config/apiRolesMatrix'

// Map arbitrary WP/user roles to apiRolesMatrix Role values; choose highest privilege
export function mapToApiRole(userRoles?: string[] | null): Role {
  if (!userRoles || userRoles.length === 0) return 'public'
  const norm = userRoles.map((r) => r.toLowerCase())
  const has = (s: string) => norm.includes(s)
  const priority: Role[] = [
    'administrator',
    'seo_manager',
    'editor',
    'seo_editor',
    'author',
    'contributor',
    'subscriber',
    'public',
  ]
  // Normalize some custom role labels
  const alias: Record<string, Role> = {
    admin: 'administrator',
    'seo manager': 'seo_manager',
    'seo_manager': 'seo_manager',
    'seo lead': 'seo_manager',
    'seo-editor': 'seo_editor',
    'seo editor': 'seo_editor',
    'seo_editor': 'seo_editor',
  }
  const resolved = new Set<Role>()
  for (const r of norm) {
    if (alias[r]) resolved.add(alias[r])
    else if (['administrator','editor','author','contributor','subscriber'].includes(r)) resolved.add(r as Role)
  }
  for (const p of priority) {
    if (resolved.has(p)) return p
  }
  return 'public'
}
