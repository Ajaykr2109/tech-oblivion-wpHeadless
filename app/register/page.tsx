
"use client"
import React, { useState } from 'react'
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RegisterPage() {
  const [status, setStatus] = useState<'idle'|'pending'|'error'|'success'>('idle')
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('pending')
    setError('')
    const form = e.target as HTMLFormElement
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': getCsrfCookie() }, body: JSON.stringify({ email: data.email, password: data.password, username: data.username }) })
      const json = await res.json() as { message?: string; status?: string }
      if (res.status === 201 && json.status === 'pending_verification') {
        setStatus('success')
        return
      }
      setError(json.message || 'An unknown error occurred.');
      setStatus('error')
    } catch {
      setError('Failed to connect to the server.');
      setStatus('error')
    }
  }

  function getCsrfCookie() {
    if (typeof document === 'undefined') return ''
    return document.cookie.split('; ').find(c => c.startsWith('csrf='))?.split('=')[1] || ''
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-6 left-6">
        <Button variant="ghost" asChild>
          <Link href="/" aria-label="Back to tech.oblivion">← Back to tech.oblivion</Link>
        </Button>
      </div>
       <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Sign up to start writing and engaging.</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
             <Alert variant="default">
              <AlertTitle>Registration Successful!</AlertTitle>
              <AlertDescription>
                Please check your inbox to verify your account.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {status === 'error' && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form className="space-y-6" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="your.email@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username (Optional)</Label>
                  <Input id="username" name="username" type="text" placeholder="your_username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={status === 'pending'}>
                  {status === 'pending' ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </>
          )}
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
