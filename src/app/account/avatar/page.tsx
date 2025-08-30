"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

type Me = { avatar_urls?: Record<string, string> }

export default function AccountAvatarPage() {
  const { toast } = useToast()
  const [me, setMe] = useState<Me | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

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

  const upload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/wp/users/avatar', { method: 'POST', body: fd })
      if (!r.ok) throw new Error(await r.text())
      toast({ title: 'Avatar updated' })
      // refresh local me
      const r2 = await fetch('/api/auth/me', { cache: 'no-store' })
      const d2 = await r2.json().catch(() => ({}))
      if (d2?.user) setMe(d2.user)
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e?.message || String(e), variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div className="p-6">Loading…</div>
  if (!me) return <div className="p-6">Please log in.</div>

  const preview = me.avatar_urls?.['128'] || me.avatar_urls?.['96'] || me.avatar_urls?.['48']

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Avatar</h1>
      <Card>
        <CardContent className="p-6 grid gap-4 max-w-xl">
          {preview && (
            <img src={preview} alt="Current avatar" className="h-24 w-24 rounded-full object-cover" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div>
            <Button disabled={!file || uploading} onClick={upload}>
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
