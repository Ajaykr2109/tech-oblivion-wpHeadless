"use client"
import { useEffect, useState } from 'react'

export default function ViewsCounter({ postId }: { postId: number }) {
  const [views, setViews] = useState<number | null>(null)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        // Debounce per session/tab for this post
        const key = `track:${postId}`
        const now = Date.now()
        const last = Number(sessionStorage.getItem(key) || '0')
        if (now - last < 5000) {
          // Skip increment; try to fetch existing views if not yet loaded
          type ViewsRow = { views?: string | number }
          const current = await fetch(`/api/analytics/views?postId=${postId}&period=day`, { cache: 'no-store' }).then(r=>r.json()).catch(()=>null) as ViewsRow[] | null
          const v = Array.isArray(current) && current.length > 0 ? parseInt(String((current[0] as ViewsRow).views || 0), 10) : null
          if (!cancelled && typeof v === 'number') setViews(v)
          return
        }
        sessionStorage.setItem(key, String(now))
        const r = await fetch(`/api/wp/track-view`, { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId }) })
        if (!cancelled && r.ok) {
          const j = await r.json().catch(() => null)
          const v = (j && (j.views_total ?? j.count))
          if (typeof v === 'number') setViews(v)
        }
      } catch {
        // Ignore view tracking errors
      }
    }
    run()
    return () => { cancelled = true }
  }, [postId])
  return <span>{views != null ? `${views.toLocaleString()} views` : '— views'}</span>
}
