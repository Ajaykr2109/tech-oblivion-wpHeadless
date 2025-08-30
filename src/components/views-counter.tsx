"use client"
import { useEffect, useState } from 'react'

export default function ViewsCounter({ postId }: { postId: number }) {
  const [views, setViews] = useState<number | null>(null)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const r = await fetch(`/api/wp/track-view`, { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postId }) })
        if (!cancelled && r.ok) {
          const j = await r.json().catch(() => null)
          const v = (j && (j.views_total ?? j.count))
          if (typeof v === 'number') setViews(v)
        }
      } catch {}
    }
    run()
    return () => { cancelled = true }
  }, [postId])
  return <span>{views != null ? `${views.toLocaleString()} views` : '— views'}</span>
}
