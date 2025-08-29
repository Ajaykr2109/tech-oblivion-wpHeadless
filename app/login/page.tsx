"use client"
import React, { useState, useEffect } from 'react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingAuth, setCheckingAuth] = useState(true)

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
      } catch (error) {
        // Not logged in, continue to show login form
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const form = e.target as HTMLFormElement
    const data = Object.fromEntries(new FormData(form) as any)
    
    try {
      const res = await fetch('/api/auth/login', { 
        method: 'POST', 
        headers: { 
          'content-type': 'application/json', 
          'x-csrf-token': getCsrfCookie() 
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
      
    } catch (err: any) {
      setError(err.message || 'Login error occurred')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Checking authentication...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div>
            <h1 className="text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your WordPress credentials
            </p>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                  Username or Email
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your username or email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
