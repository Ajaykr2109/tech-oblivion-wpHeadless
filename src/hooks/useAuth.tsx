"use client"

import React from 'react'

import { useAuth as useAuthContext } from '@/contexts/auth-context'
import type { Action } from '@/lib/roles'

// Re-export the main hook from context
export const useAuth = useAuthContext

// Convenience hook for role checking
export function useAuthRole() {
  const auth = useAuth()
  
  return {
    ...auth,
    isAdmin: auth.can('admin'),
    isEditor: auth.can('editOthers'),
    isModerator: auth.can('moderateComments'),
    canComment: auth.can('comment'),
  }
}

// Enhanced RoleGate component with loading states
interface RoleGateProps {
  action: Action
  children: React.ReactNode
  fallback?: React.ReactNode
  loadingFallback?: React.ReactNode
  as?: 'div' | 'span'
  className?: string
  hideWhenUnauthorized?: boolean
}

export function RoleGate({ 
  action, 
  children, 
  fallback = null,
  loadingFallback = null,
  as = 'div',
  className,
  hideWhenUnauthorized = false
}: RoleGateProps) {
  const { can, isLoading } = useAuth()
  const Cmp = as as keyof JSX.IntrinsicElements
  
  if (isLoading) {
    return loadingFallback ? <>{loadingFallback}</> : <Cmp className={className} aria-busy="true">{children}</Cmp>
  }
  
  if (can(action)) {
    return <Cmp className={className}>{children}</Cmp>
  }
  
  if (hideWhenUnauthorized) {
    return null
  }
  
  return fallback ? <>{fallback}</> : <Cmp className={className} aria-disabled="true" style={{ opacity: 0.5, pointerEvents: 'none' }}>{children}</Cmp>
}

// Hook for components that need to conditionally render based on specific roles
export function useRoleCheck(role: string) {
  const { hasRole, isLoading } = useAuth()
  
  return {
    hasRole: hasRole(role),
    isLoading,
  }
}

// Hook for action-based permissions
export function usePermission(action: Action) {
  const { can, isLoading } = useAuth()
  
  return {
    allowed: can(action),
    isLoading,
  }
}