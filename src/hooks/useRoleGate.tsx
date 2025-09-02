"use client"
import { useEffect, useState } from 'react'

import { can as canAction, messageFor, normalizeRole, type Action } from '@/lib/roles'

type Me = { roles?: string[] } | null

export function useMe() {
  const [me, setMe] = useState<Me>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const r = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!cancelled) {
          if (r.ok) {
            try {
              const j = await r.json()
              // API returns { user } wrapper
              setMe((j && typeof j === 'object' && 'user' in j) ? (j as { user: Me }).user : (j as Me))
            } catch { setMe(null) }
          } else setMe(null)
        }
      } catch {
        if (!cancelled) setMe(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    const onFocus = () => run()
  const onLogin = () => run()
    window.addEventListener('focus', onFocus)
    window.addEventListener('visibilitychange', onFocus)
  window.addEventListener('auth:login', onLogin as unknown as EventListener)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('visibilitychange', onFocus)
  window.removeEventListener('auth:login', onLogin as unknown as EventListener)
    }
  }, [])
  return { me, loading }
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
