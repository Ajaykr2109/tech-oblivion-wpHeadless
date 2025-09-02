"use client";
import { useEffect, useState } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

type Me = {
  id: number | string
  username: string
  name?: string
  email?: string
  roles?: string[]
  description?: string
  avatar_urls?: Record<string, string>
  url?: string
  locale?: string
  nickname?: string
  profile_fields?: Record<string, string>
}

export default function AccountCenter() {
  const { toast } = useToast()
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { cache: "no-store" })
        if (r.ok) {
          const data = await r.json()
          if (data?.user) setMe(data.user)
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const isAdmin = !!me?.roles?.includes("administrator")

  if (loading) return <div className="p-6">Loading…</div>
  if (!me) return <div className="p-6">Please log in.</div>

  // --- sections ---
  const ProfileSection = (
    <form
      onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const payload = {
          name: String(fd.get('name') || ''),
          nickname: String(fd.get('nickname') || ''),
          email: String(fd.get('email') || ''),
          url: String(fd.get('url') || ''),
          description: String(fd.get('description') || ''),
        }
        // prune empty strings so WP doesn't clear unintentionally
        Object.keys(payload).forEach((k) => { if ((payload as Record<string, string>)[k] === '') delete (payload as Record<string, string>)[k] })
        setSaving(true)
        try {
          const r = await fetch('/api/wp/users/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (!r.ok) {
            const t = await r.text().catch(() => '')
            throw new Error(t || 'Update failed')
          }
          toast({ title: 'Profile updated' })
          // refresh local user state
          try {
            const r2 = await fetch('/api/auth/me', { cache: 'no-store' })
            if (r2.ok) {
              const d2 = await r2.json().catch(() => ({} as { user?: unknown }))
              if (d2?.user) setMe(d2.user)
            }
          } catch {
            // ignore refresh error
          }
        } catch (err: unknown) {
          toast({ title: 'Update failed', description: err instanceof Error ? err.message : String(err), variant: 'destructive' })
        } finally {
          setSaving(false)
        }
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">Display Name</Label>
        <Input id="name" name="name" defaultValue={me.name} />
      </div>
      <div>
        <Label htmlFor="nickname">Nickname</Label>
        <Input id="nickname" name="nickname" defaultValue={me.nickname} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={me.email} />
      </div>
      <div>
        <Label htmlFor="url">Website</Label>
        <Input id="url" name="url" type="url" defaultValue={me.url} />
      </div>
      <div>
        <Label htmlFor="description">Bio</Label>
        <Textarea id="description" name="description" defaultValue={me.description} />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  )

  const AdminSection = (
    <div>
      <h2 className="text-xl font-semibold mb-2">Admin Tools</h2>
      <div className="flex gap-2">
        <Button asChild><a href="/admin">Dashboard</a></Button>
        <Button variant="outline" asChild><a href="/admin/posts">Posts</a></Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <Card>
        <CardContent className="p-6">
          {ProfileSection}
        </CardContent>
      </Card>

      {isAdmin && (
        <Card className="mt-6">
          <CardContent className="p-6">
            {AdminSection}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
