"use client"
import { useEffect, useState } from 'react'

export default function ViewsCounter({ postId }: { postId: number }) {
  const [views, setViews] = useState<number | null>(null)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        // Fetch total views directly from WordPress post meta
        interface PostViewsResponse {
          post_id: number
          views_total: number
          timestamp: string
        }
        
        const response = await fetch(`/api/wp/post-views/${postId}`, { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data: PostViewsResponse = await response.json()
        if (!cancelled && typeof data.views_total === 'number') {
          setViews(data.views_total)
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
