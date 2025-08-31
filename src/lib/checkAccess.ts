import { apiRolesMatrix, type AccessLevel, type Role } from '@/config/apiRolesMatrix'

export function checkAccess(
  role: Role,
  path: string,
  method: string,
  action: AccessLevel
): boolean {
  const methodUpper = method.toUpperCase()
  // Direct match first
  let endpoint = apiRolesMatrix.find((e) => e.path === path && e.method === (methodUpper as any))
  if (!endpoint) {
    // Try parameterized segments: replace [param] to match dynamic route
    endpoint = apiRolesMatrix.find((e) => {
      if (e.method !== (methodUpper as any)) return false
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

export default checkAccess
