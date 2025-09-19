"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'

import { normalizeRole, can } from '@/lib/roles'
import type { Action } from '@/lib/roles'

interface User {
  id: string
  username: string
  email: string
  displayName: string
  url?: string
  website?: string
  // Public profile slug identifiers
  slug?: string
  user_nicename?: string
  // Additional core profile fields from WP
  name?: string
  nickname?: string
  locale?: string
  description?: string
  avatar_urls?: Record<string, string>
  roles?: string[]
  // Canonical container coming from WP via FE Auth Bridge
  profile_fields?: Record<string, string>
  // Legacy fallback
  meta?: Record<string, string>
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  roles: string[]
  normalizedRole: string
  hasRole: (role: string) => boolean
  can: (action: Action) => boolean
  login: (credentials: { identifier: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return a more complete fallback with all properties to maintain type consistency
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      roles: [],
      normalizedRole: 'guest',
      hasRole: () => false,
      can: () => false,
      login: async () => {},
      logout: async () => {},
      checkAuth: async () => {},
    } as AuthContextType
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = Boolean(user)
  const roles = useMemo(() => user?.roles || [], [user?.roles])
  const normalizedRole = normalizeRole(roles)

  const hasRole = useCallback((role: string) => {
    return roles.includes(role)
  }, [roles])

  const canPerformAction = useCallback((action: Action) => {
    return can(roles, action)
  }, [roles])

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        const u = data?.user || null
        // Normalize profile_fields (preferred) or meta (fallback) to Record<string,string>
        const normalize = (obj: unknown) => {
          const out: Record<string, string> = {}
          try {
            if (obj && typeof obj === 'object') {
              Object.entries(obj).forEach(([k, v]) => {
                if (v == null) return
                if (Array.isArray(v)) {
                  const val = v.find((x) => typeof x === 'string' && x.trim()) as string | undefined
                  if (val) out[k] = val
                } else if (typeof v === 'string') {
                  out[k] = v
                } else if (typeof v === 'number' || typeof v === 'boolean') {
                  out[k] = String(v)
                }
              })
            }
          } catch {
            // Ignore normalization errors - return empty object
          }
          return out
        }
        if (u) {
          if (u.profile_fields && typeof u.profile_fields === 'object') {
            u.profile_fields = normalize(u.profile_fields)
          } else if (u.meta && typeof u.meta === 'object') {
            // migration path: surface old meta as profile_fields for consumers
            u.profile_fields = normalize(u.meta)
          }
        }
        setUser(u)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (credentials: { identifier: string; password: string }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.message || 'Login failed')
    }

    const data = await res.json()
    setUser(data.user)
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
    }
  }

  useEffect(() => {
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount - checkAuth is stable due to useCallback with empty deps

  // Listen for auth events with throttling to prevent spam
  useEffect(() => {
    let lastCheck = 0
    const THROTTLE_MS = 30000 // Only recheck auth every 30 seconds

    const handleAuthLogin = () => checkAuth()
    const handleVisibilityChange = () => {
      const now = Date.now()
      if (!document.hidden && (now - lastCheck) > THROTTLE_MS) {
        lastCheck = now
        checkAuth()
      }
    }
    const handleFocus = () => {
      const now = Date.now()
      if ((now - lastCheck) > THROTTLE_MS) {
        lastCheck = now
        checkAuth()
      }
    }

    window.addEventListener('auth:login', handleAuthLogin)
    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('auth:login', handleAuthLogin)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [checkAuth])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    roles,
    normalizedRole,
    hasRole,
    can: canPerformAction,
    login,
    logout,
    checkAuth,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
