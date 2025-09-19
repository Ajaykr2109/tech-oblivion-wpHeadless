"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/hooks/useAuth'

interface ClientRoleGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireEditor?: boolean
  fallback?: React.ReactNode
}

export function ClientRoleGuard({ 
  children, 
  requireAdmin = false, 
  requireEditor = false,
  fallback 
}: ClientRoleGuardProps) {
  const { user, isLoading, can } = useAuth()
  const router = useRouter()

  const isAdmin = can('admin')
  const isEditor = can('editOthers')

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading...</div>
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  // Check permissions
  let hasPermission = true
  if (requireAdmin && !isAdmin) {
    hasPermission = false
  } else if (requireEditor && !isEditor) {
    hasPermission = false
  }

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>
    }
    router.push('/403')
    return null
  }

  return <>{children}</>
}
