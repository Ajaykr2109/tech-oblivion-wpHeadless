import React from 'react'

export default function UserMenu({ user }: { user: Record<string, unknown> }) {
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', headers: { 'x-csrf-token': getCsrfCookie() } })
    // reload client
    window.location.href = '/login'
  }

  function getCsrfCookie() {
    if (typeof document === 'undefined') return ''
    return document.cookie.split('; ').find(c => c.startsWith('csrf='))?.split('=')[1] || ''
  }

  return (
    <div>
      <div>{(user.display_name as string) || (user.username as string)}</div>
      <div>Roles: {Array.isArray(user.roles) ? user.roles.join(', ') : ''}</div>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
