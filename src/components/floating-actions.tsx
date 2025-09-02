"use client"
import { useEffect, useState } from 'react'
import { Share2, Bookmark, BookmarkCheck, Printer } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RoleGate, useRoleGate } from '@/hooks/useRoleGate'
import { useToast } from '@/hooks/use-toast'

export default function FloatingActions({ title, postId }: { title: string; postId?: number }) {
  const url = typeof window !== 'undefined' ? window.location.href : ''
  const { allowed } = useRoleGate('bookmark')
  const { toast } = useToast()
  const [bookmarkState, setBookmarkState] = useState<{ bookmarked: boolean; count: number } | null>(null)
  const [busy, setBusy] = useState(false)
  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast({ title: 'Link copied', description: 'Post URL copied to clipboard.' })
      }
    } catch {
      // Ignore share/clipboard errors - fallback to manual copy
    }
  }
  function printPage() { try { window.print() } catch { /* Ignore print errors */ } }

  useEffect(() => {
    let cancelled = false
    if (!postId) return
    ;(async () => {
      try {
        const r = await fetch(`/api/wp/bookmarks?postId=${encodeURIComponent(String(postId))}`, { cache: 'no-store' })
        if (!r.ok) return
        const j = await r.json().catch(() => null)
        if (!cancelled && j && typeof j === 'object') setBookmarkState({ bookmarked: !!j.bookmarked, count: Number(j.count || 0) })
      } catch {
        // Ignore bookmark fetch errors - keep default state
      }
    })()
    return () => { cancelled = true }
  }, [postId])

  async function bookmark() {
    if (!allowed || !postId || busy) return
    setBusy(true)
    try {
      const r = await fetch('/api/wp/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })
      if (r.status === 401) {
        toast({ title: 'Login required', description: 'Please log in to bookmark.', variant: 'destructive' })
        return
      }
      if (!r.ok) throw new Error('Failed to update')
      const j = await r.json().catch(() => null)
      if (j && typeof j === 'object') {
        setBookmarkState({ bookmarked: !!j.bookmarked, count: Number(j.count || 0) })
        toast({ title: j.bookmarked ? 'Saved' : 'Removed', description: j.bookmarked ? 'Added to your bookmarks.' : 'Removed from your bookmarks.' })
      }
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Could not update bookmark', variant: 'destructive' })
    } finally { setBusy(false) }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-2 items-center">
      <Button size="icon" variant="secondary" className="shadow" onClick={share} aria-label="Share">
        <Share2 className="h-4 w-4" />
      </Button>
      <RoleGate action="bookmark" disabledClassName="opacity-50">
        <Button size="icon" variant="secondary" className="shadow" aria-label="Bookmark" onClick={bookmark} disabled={busy}>
          {bookmarkState?.bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </Button>
      </RoleGate>
      <Button size="icon" variant="secondary" className="shadow" onClick={printPage} aria-label="Print">
        <Printer className="h-4 w-4" />
      </Button>
    </div>
  )
}
