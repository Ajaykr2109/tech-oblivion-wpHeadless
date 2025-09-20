"use client"
import { useEffect, useRef } from 'react'

interface PostViewTrackerProps {
  postId: number
}

export default function PostViewTracker({ postId }: PostViewTrackerProps) {
  const tracked = useRef(false)

  useEffect(() => {
    // Only track once per component mount
    if (tracked.current || !postId) return
    tracked.current = true

    const trackPostView = async () => {
      try {
        const response = await fetch('/api/wp/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
          body: JSON.stringify({ post_id: postId }),
        })

        if (!response.ok) {
          console.warn('Failed to track post view:', response.status, response.statusText)
          // Don't throw here, just log the warning
        } else {
          // Optionally log successful tracking in development
          if (process.env.NODE_ENV === 'development') {
            const data = await response.json()
            console.log('Post view tracked successfully:', { postId, views_total: data.views_total })
          }
        }
      } catch (error) {
        console.warn('Error tracking post view:', error)
      }
    }

    // Small delay to avoid race conditions with page load
    const timeoutId = setTimeout(trackPostView, 500)

    return () => clearTimeout(timeoutId)
  }, [postId])

  // This component renders nothing
  return null
}