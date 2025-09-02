
"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [csrf, setCsrf] = useState('')

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          // User is already logged in, redirect to homepage
          window.location.href = '/'
          return
        }
      } catch {
        // Not logged in, continue to show login form
      } finally {
        setCheckingAuth(false)
      }
    }

    // Ensure CSRF token exists
    const ensureCsrf = async () => {
      try {
        const existing = getCsrfCookie()
        if (existing) {
          setCsrf(existing)
          return
        }
        const res = await fetch('/api/csrf')
        if (res.ok) {
          const j = await res.json()
          setCsrf(j.token)
        }
      } catch {
        // Ignore CSRF fetch errors - will retry on form submission
      }
    }

    ensureCsrf()
    checkAuth()
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const form = e.target as HTMLFormElement
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    
    try {
      const res = await fetch('/api/auth/login', { 
        method: 'POST', 
        headers: { 
          'content-type': 'application/json', 
          'x-csrf-token': csrf || getCsrfCookie() 
        }, 
        body: JSON.stringify({ 
          identifier: data.identifier, 
          password: data.password 
        }) 
      })
      
      if (res.status === 401) {
        const json = await res.json()
        setError(json.message || 'Invalid credentials')
        return
      }
      
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Login failed')
      }
      
      // Success - redirect to homepage
      const params = new URLSearchParams(window.location.search)
      const next = params.get('next') || '/'
      window.location.href = next
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  function getCsrfCookie() {
    if (typeof document === 'undefined') return ''
    return document.cookie.split('; ').find(c => c.startsWith('csrf='))?.split('=')[1] || ''
  }

  // Show loading while checking if user is already authenticated
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Checking authentication...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign in to your account</CardTitle>
          <CardDescription>Enter your WordPress credentials to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4" role="alert" aria-live="assertive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="identifier">Username or Email</Label>
              <Input id="identifier" name="identifier" type="text" placeholder="you@example.com or username" autoComplete="username" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/forgot-password" className="underline text-muted-foreground hover:text-foreground">
                  Forgot your password?
                </Link>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} aria-busy={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
