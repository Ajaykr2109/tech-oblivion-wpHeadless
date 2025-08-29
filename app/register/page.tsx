"use client"
import React, { useState } from 'react'
export default function RegisterPage() {
  const [status, setStatus] = useState<'idle'|'pending'|'error'|'success'>('idle')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('pending')
    const form = e.target as HTMLFormElement
    const data = Object.fromEntries(new FormData(form) as any)
    try {
      const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'content-type': 'application/json', 'x-csrf-token': getCsrfCookie() }, body: JSON.stringify({ email: data.email, password: data.password, username: data.username }) })
      const json = await res.json()
      if (res.status === 201 && json.status === 'pending_verification') {
        setStatus('success')
        return
      }
      setStatus('error')
      alert(json.message || 'Error')
    } catch (err: any) {
      setStatus('error')
    }
  }

  function getCsrfCookie() {
    if (typeof document === 'undefined') return ''
    return document.cookie.split('; ').find(c => c.startsWith('csrf='))?.split('=')[1] || ''
  }

  return (
    <main>
      <h1>Register</h1>
      {status === 'success' ? (
        <div>Check your inbox to verify your account.</div>
      ) : (
        <form onSubmit={onSubmit}>
          <label>Email<input name="email" type="email" required/></label>
          <label>Username<input name="username" /></label>
          <label>Password<input name="password" type="password" required/></label>
          <button type="submit">Register</button>
        </form>
      )}
    </main>
  )
}
