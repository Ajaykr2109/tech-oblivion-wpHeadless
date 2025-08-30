"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

type Me = {
  id: number | string
  username: string
  name?: string
  email?: string
  description?: string
  url?: string
  locale?: string
  nickname?: string
}

export default function AccountProfilePage() {
  const { toast } = useToast()
  const [me, setMe] = useState<Me | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch('/api/auth/me', { cache: 'no-store' })
        if (r.ok) {
          const data = await r.json()
          if (data?.user) setMe(data.user)
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!me) return
    const fd = new FormData(e.currentTarget)
    const payload: any = {
      name: String(fd.get('name') || ''),
      nickname: String(fd.get('nickname') || ''),
      email: String(fd.get('email') || ''),
      url: String(fd.get('url') || ''),
      description: String(fd.get('description') || ''),
      locale: String(fd.get('locale') || ''),
    }
    // prune empties to avoid unintended clears
    Object.keys(payload).forEach((k) => {
      if (payload[k] === '') delete payload[k]
    })

    setSaving(true)
    try {
      const r = await fetch('/api/wp/users/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!r.ok) {
        const t = await r.text().catch(() => '')
        throw new Error(t || 'Update failed')
      }
      toast({ title: 'Profile updated' })
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.message || String(err), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading…</div>
  if (!me) return <div className="p-6">Please log in.</div>

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Edit Profile</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="grid gap-6 max-w-2xl">
            <div className="grid gap-2">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" name="name" defaultValue={me.name || me.nickname || (me as any).displayName} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input id="nickname" name="nickname" defaultValue={me.nickname} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={me.email} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">Website</Label>
              <Input id="url" name="url" type="url" defaultValue={me.url} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="locale">Locale</Label>
              <Input id="locale" name="locale" placeholder="en_US" defaultValue={me.locale} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Bio</Label>
              <Textarea id="description" name="description" rows={4} defaultValue={me.description} />
            </div>
            <div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
