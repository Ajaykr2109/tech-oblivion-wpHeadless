"use client"
import { useEffect, useState } from 'react'

export default function ViewsCounter({ postId }: { postId: number }) {
  const [views, setViews] = useState<number | null>(null)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        // Read-only: fetch current aggregated views for the post from analytics API
        type ViewsRow = { views?: string | number }
        const current = await fetch(`/api/analytics/views?postId=${postId}&period=day`, { cache: 'no-store' })
          .then(r => r.ok ? r.json() : null)
          .catch(() => null) as ViewsRow[] | null
        const v = Array.isArray(current) && current.length > 0 ? parseInt(String((current[0] as ViewsRow).views || 0), 10) : null
        if (!cancelled && typeof v === 'number') setViews(v)
      } catch {
        // Ignore view tracking errors
      }
    }
    run()
    return () => { cancelled = true }
  }, [postId])
  return <span>{views != null ? `${views.toLocaleString()} views` : '— views'}</span>
}
