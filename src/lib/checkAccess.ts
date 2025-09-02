import { apiRolesMatrix, type AccessLevel, type Role } from '@/config/apiRolesMatrix'

export function checkAccess(
  role: Role,
  path: string,
  method: string,
  action: AccessLevel
): boolean {
  const methodUpper = method.toUpperCase() as 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  // Direct match first
  let endpoint = apiRolesMatrix.find((e) => e.path === path && e.method === methodUpper)
  if (!endpoint) {
    // Try parameterized segments: replace [param] to match dynamic route
    endpoint = apiRolesMatrix.find((e) => {
      if (e.method !== methodUpper) return false
      const pattern = e.path
        .replace(/\//g, '\\/')
        .replace(/\[.+?\]/g, '[^/]+')
        .replace(/\.+/g, '.+')
      const re = new RegExp(`^${pattern}$`)
      return re.test(path)
    })
  }

  if (!endpoint) return false
  return endpoint.roles[role]?.includes(action) ?? false
}

export async function getRoleMatrix() {
  const res = await fetch('/api/roles/matrix', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch role matrix')
  return res.json()
}

export function simplifiedCheckAccess(role: 'admin' | 'editor' | 'viewer' | 'guest', action: string): boolean {
  const permissions: Record<string, string[]> = {
    admin: ['view', 'edit', 'delete', 'publish', 'draft', 'settings', 'moderate', 'admin'],
    editor: ['view', 'edit', 'publish', 'draft', 'moderate'],
    viewer: ['view', 'draft'],
    guest: ['view'],
  }
  return permissions[role]?.includes(action) ?? false
}

export default checkAccess
