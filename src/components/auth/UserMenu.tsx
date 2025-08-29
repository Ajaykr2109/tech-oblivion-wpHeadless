import React from 'react'

export default function UserMenu({ user }: { user: any }) {
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
      <div>{user.display_name || user.username}</div>
      <div>Roles: {(user.roles || []).join(', ')}</div>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
