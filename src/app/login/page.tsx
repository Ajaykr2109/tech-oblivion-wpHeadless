'use client'

import { useEffect, useState } from 'react'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [nextUrl, setNextUrl] = useState<string | null>(null)

  useEffect(() => {
    try {
      const u = new URL(window.location.href)
      const n = u.searchParams.get('next')
      if (n) setNextUrl(n)
    } catch {}
    // If already logged in, bounce early
    ;(async () => {
      try {
        const r = await fetch('/api/auth/me', { cache: 'no-store' })
        if (r.ok) {
          const d = await r.json()
          if (d?.user) {
            window.location.href = nextUrl || '/account'
          }
        }
      } catch {}
    })()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.message || 'Login failed')
      }
  window.location.href = nextUrl || '/account'
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <h1 className="text-2xl font-semibold mb-6">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Username or Email</label>
          <input className="w-full border rounded px-3 py-2" value={identifier} onChange={e => setIdentifier(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="bg-primary text-primary-foreground px-4 py-2 rounded w-full">{loading ? 'Signing in…' : 'Sign In'}</button>
      </form>
    </div>
  )
}
