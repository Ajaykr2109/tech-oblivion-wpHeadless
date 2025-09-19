"use client"
import { useEffect, useState, useMemo } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

type Me = {
  id: number | string
  username: string
  name?: string
  email?: string
  description?: string
  url?: string
  locale?: string
  nickname?: string
  website?: string
  profile_fields?: Record<string, string>
}

export default function AccountProfilePage() {
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()
  const [me, setMe] = useState<Me | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const allowedKeys = useMemo(() => ["insta", "fb", "youtube", "github", "linked"] as const, [])
  const [fields, setFields] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setMe(user as unknown as Me)
      const profile = user.profile_fields && typeof user.profile_fields === 'object' ? (user.profile_fields as Record<string, unknown>) : {}
      const init: Record<string, string> = {}
      allowedKeys.forEach((k) => {
        const v = profile[k]
        init[k] = typeof v === 'string' ? v : ''
      })
      setFields(init)
    }
    setLoading(false)
  }, [user, allowedKeys])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!me) return
    const fd = new FormData(e.currentTarget)
    const payload = {
      name: String(fd.get("name") || ""),
      nickname: String(fd.get("nickname") || ""),
      email: String(fd.get("email") || ""),
      url: String(fd.get("url") || ""),
      description: String(fd.get("description") || ""),
      locale: String(fd.get("locale") || ""),
      profile_fields: Object.fromEntries(
        Object.entries(fields)
          .filter(([k]) => (allowedKeys as readonly string[]).includes(k))
          .map(([k, v]) => [k, String(v ?? "").trim()])
          .filter(([, v]) => v.length > 0)
      ) as Record<string, string>,
    }
    Object.keys(payload).forEach((k) => {
      if ((payload as Record<string, unknown>)[k] === "") delete (payload as Record<string, unknown>)[k]
    })

    setSaving(true)
    try {
      const r = await fetch("/api/wp/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!r.ok) {
        const t = await r.text().catch(() => "")
        throw new Error(t || "Update failed")
      }
      toast({ title: "Profile updated" })
    } catch (err: unknown) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if ((loading || authLoading) && !me) return <div className="p-6">Loading…</div>
  if (!me) return <div className="p-6">Please log in.</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card className="shadow-lg border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
          <p className="text-sm text-muted-foreground">
            Keep your profile up to date. People see this info across your account.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={me.name || me.nickname || (me as Me & { displayName?: string }).displayName}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                name="nickname"
                defaultValue={me.nickname}
                placeholder="e.g. Johnny"
              />
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
              <Textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={me.description}
                placeholder="Write a short bio about yourself..."
              />
            </div>

            <fieldset className="grid gap-4 rounded-lg border p-4">
              <legend className="text-lg font-semibold px-1">Profile links</legend>
              <p className="text-sm text-muted-foreground">
                Add your social links (optional).
              </p>
              {[
                { key: "insta", label: "Instagram", ph: "https://instagram.com/yourhandle" },
                { key: "fb", label: "Facebook", ph: "https://facebook.com/yourpage" },
                { key: "youtube", label: "YouTube", ph: "https://youtube.com/@yourchannel" },
                { key: "github", label: "GitHub", ph: "https://github.com/yourname" },
                { key: "linked", label: "LinkedIn", ph: "https://linkedin.com/in/yourname" },
              ].map(({ key, label, ph }) => (
                <div key={key} className="flex items-center gap-2">
                  <Label className="w-28 shrink-0">{label}</Label>
                  <Input
                    placeholder={ph}
                    value={fields[key] || ""}
                    onChange={(e) => setFields((p) => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </fieldset>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="w-40">
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
