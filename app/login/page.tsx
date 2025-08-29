"use client"
import React from 'react'

export default function LoginPage() {
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const data = Object.fromEntries(new FormData(form) as any)
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': getCsrfCookie() }, body: JSON.stringify({ identifier: data.identifier, password: data.password }) })
      if (res.status === 401) {
        const json = await res.json()
        alert(json.message || 'Unauthorized')
        return
      }
      if (!res.ok) throw new Error('Login failed')
      const params = new URLSearchParams(window.location.search)
      const next = params.get('next') || '/dashboard'
      window.location.href = next
    } catch (err: any) {
      alert(err.message || 'Error')
    }
  }

  function getCsrfCookie() {
    if (typeof document === 'undefined') return ''
    return document.cookie.split('; ').find(c => c.startsWith('csrf='))?.split('=')[1] || ''
  }

  return (
    <main>
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        <label>Identifier<input name="identifier" /></label>
        <label>Password<input name="password" type="password" /></label>
        <button type="submit">Sign in</button>
      </form>
    </main>
  )
}
