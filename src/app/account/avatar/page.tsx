"use client"
import { useEffect, useState } from 'react'
import Image from 'next/image'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

type Me = { avatar_urls?: Record<string, string> }

export default function AccountAvatarPage() {
  const { toast } = useToast()
  const { user, checkAuth, isLoading: authLoading } = useAuth()
  const [me, setMe] = useState<Me | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user) setMe(user as unknown as Me)
    setLoading(false)
  }, [user])

  const upload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await fetch('/api/wp/users/avatar', { method: 'POST', body: fd })
      if (!r.ok) throw new Error(await r.text())
      toast({ title: 'Avatar updated' })
  // refresh auth state and local me
  await checkAuth()
  if (user) setMe(user as unknown as Me)
    } catch (e: unknown) {
      toast({ title: 'Upload failed', description: e instanceof Error ? e.message : String(e), variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  if ((loading || authLoading) && !me) return <div className="p-6">Loading…</div>
  if (!me) return <div className="p-6">Please log in.</div>

  const preview = me.avatar_urls?.['128'] || me.avatar_urls?.['96'] || me.avatar_urls?.['48']

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Avatar</h1>
      <Card>
        <CardContent className="p-6 grid gap-4 max-w-xl">
          {preview && (
            <Image src={preview} alt="Current avatar" width={96} height={96} className="h-24 w-24 rounded-full object-cover" unoptimized />
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
