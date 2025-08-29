import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

export default async function DashboardPage() {
  const host = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const cookie = (await headers()).get('cookie') || ''
  const res = await fetch(`${host}/api/auth/me`, { headers: { cookie }, cache: 'no-store' })
  if (res.status === 401) {
    redirect(`/login?next=/dashboard`)
  }
  const json = await res.json()
  const user = json.user ?? json

  return (
    <main>
      <h1>Dashboard</h1>
      <div>Name: {user.display_name}</div>
      <div>Roles: {(user.roles || []).join(', ')}</div>
    </main>
  )
}
