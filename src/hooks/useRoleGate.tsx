"use client"
import { useEffect, useState } from 'react'

import { can as canAction, messageFor, Action } from '@/lib/roles'

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
              setMe((j && typeof j === 'object' && 'user' in j) ? (j as any).user : j)
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
    window.addEventListener('auth:login', onLogin as any)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('visibilitychange', onFocus)
      window.removeEventListener('auth:login', onLogin as any)
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

type GateProps = React.PropsWithChildren<{
  action: Action
  as?: 'div' | 'span'
  className?: string
  disabledClassName?: string
  tooltip?: boolean
}>

export function RoleGate({ action, children, as = 'div', className, disabledClassName, tooltip = true }: GateProps) {
  const { allowed, reason, loading } = useRoleGate(action)
  const Cmp: any = as
  if (loading) return <Cmp className={className} aria-busy="true">{children}</Cmp>
  if (allowed) return <Cmp className={className}>{children}</Cmp>
  const merged = [className, disabledClassName || 'opacity-50 pointer-events-none select-none'].filter(Boolean).join(' ')
  return (
    <Cmp className={merged} aria-disabled="true" title={tooltip ? reason : undefined}>
      {children}
    </Cmp>
  )
}
