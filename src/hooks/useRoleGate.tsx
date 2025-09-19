"use client"

import { useAuth as useAuthContext } from '@/contexts/auth-context'
import { can as canAction, messageFor, normalizeRole, type Action } from '@/lib/roles'

export function useMe() {
  const { user, isLoading } = useAuthContext()
  const me = user ? { roles: user.roles } : null
  return { me, loading: isLoading }
}

export function useRoleGate(action: Action) {
  const { me, loading } = useMe()
  const roles = me?.roles || null
  const allowed = canAction(roles, action)
  const reason = allowed ? '' : messageFor(roles, action)
  return { allowed, reason, loading, me }
}

export function useSimpleAccess(role: 'admin' | 'editor' | 'viewer' | 'guest', action: string) {
  const { me, loading } = useMe()
  const roles = me?.roles || null
  const currentRole = normalizeRole(roles)
  const roleMapping: Record<string, 'admin' | 'editor' | 'viewer' | 'guest'> = {
    admin: 'admin',
    publisher: 'editor',
    editor: 'editor',
    author: 'editor',
    writer: 'viewer',
    reader: 'viewer',
    seo_lead: 'editor',
    seo_specialist: 'viewer',
    guest: 'guest',
  }
  const mappedRole = roleMapping[currentRole] || 'guest'
  const permissions: Record<string, string[]> = {
    admin: ['view', 'edit', 'delete', 'publish', 'draft', 'settings', 'moderate', 'admin'],
    editor: ['view', 'edit', 'publish', 'draft', 'moderate'],
    viewer: ['view', 'draft'],
    guest: ['view'],
  }
  const allowed = permissions[mappedRole]?.includes(action) ?? false
  return { allowed, loading, me, currentRole: mappedRole }
}

type GateProps = React.PropsWithChildren<{
  action: Action
  as?: 'div' | 'span'
  className?: string
  disabledClassName?: string
  tooltip?: boolean
}>

export function RoleGate({ action, children, as = 'div', className, disabledClassName, tooltip = true }: GateProps) {
  const { allowed, reason, loading } = useRoleGate(action)
  const Cmp = as as keyof JSX.IntrinsicElements
  if (loading) return <Cmp className={className} aria-busy="true">{children}</Cmp>
  if (allowed) return <Cmp className={className}>{children}</Cmp>
  const merged = [className, disabledClassName || 'opacity-50 pointer-events-none select-none'].filter(Boolean).join(' ')
  return (
    <Cmp className={merged} aria-disabled="true" title={tooltip ? reason : undefined}>
      {children}
    </Cmp>
  )
}
