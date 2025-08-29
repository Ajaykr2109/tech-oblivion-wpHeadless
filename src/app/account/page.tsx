"use client";
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Me = {
  id: number|string
  username: string
  name?: string
  email?: string
  roles?: string[]
  description?: string
  avatar_urls?: Record<string,string>
  url?: string
  locale?: string
  nickname?: string
}

export default function AccountCentral() {
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/wp/users/me', { cache: 'no-store' })
        if (r.ok) setMe(await r.json())
      } finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div className="container mx-auto px-4 py-10">Loading…</div>

  if (!me) return <div className="container mx-auto px-4 py-10">Please log in.</div>

  const isAdmin = !!me.roles?.includes('administrator')

  return (
    <div className="container mx-auto px-4 py-10 grid gap-6">
      <h1 className="text-3xl font-bold">Account Central</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2">Account Info</h2>
            <div className="text-sm text-muted-foreground">Username: {me.username}</div>
            <div className="text-sm text-muted-foreground">Display name: {me.name || me.nickname}</div>
            <div className="text-sm text-muted-foreground">Email: {me.email}</div>
            <div className="text-sm text-muted-foreground">Roles: {me.roles?.join(', ')}</div>
            <div className="text-sm text-muted-foreground">ID: {String(me.id)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2">Profile Settings</h2>
            <Button variant="outline" size="sm">Edit Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2">Security</h2>
            <Button variant="outline" size="sm">Change Password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-xl font-semibold mb-2">Activity</h2>
            <div className="text-sm text-muted-foreground">Followers, following, recent activity</div>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Admin</h2>
          <div className="flex gap-2">
            <Button asChild><a href="/admin">Dashboard</a></Button>
            <Button variant="outline" asChild><a href="/admin/posts">Posts</a></Button>
          </div>
        </div>
      )}
    </div>
  )
}
