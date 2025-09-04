"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { isAdmin, isEditor } from '@/lib/permissions'
import type { User } from '@/lib/auth'

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
  const [_user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', { 
          cache: 'no-store',
          credentials: 'include' 
        })
        
        if (response.ok) {
          const data = await response.json()
          const userData = data.user
          setUser(userData)
          
          // Check permissions
          let hasPermission = true
          if (requireAdmin && !isAdmin(userData)) {
            hasPermission = false
          } else if (requireEditor && !isEditor(userData)) {
            hasPermission = false
          }
          
          setAuthorized(hasPermission)
          
          // If logged in but lacking permissions, show 403 instead of redirecting
          if (userData && !hasPermission) {
            // Don't redirect - just show 403 component
          }
        } else {
          // Not logged in - redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [requireAdmin, requireEditor, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!authorized) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          You don't have permission to access this page. 
          {requireAdmin && ' Administrator access is required.'}
          {requireEditor && !requireAdmin && ' Editor access is required.'}
        </p>
        <button 
          onClick={() => router.back()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    )
  }

  return <>{children}</>
}
