"use client"

import { useEffect, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import CommentsList, { CommentItem } from './CommentsList'

const commentsCache = new Map<string, CommentItem[]>()

export default function CommentsTabClient({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<CommentItem[] | null>(null)

  useEffect(() => {
    let mounted = true
    const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
    const cached = commentsCache.get(slug)
    if (cached) {
      setComments(cached)
      setLoading(false)
      return
    }
    const controller = new AbortController()
    const run = async () => {
      try {
        const res = await fetch(`${site}/api/wp/users/${encodeURIComponent(slug)}`, {
          cache: 'force-cache',
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        const c = Array.isArray(data?.recent_comments) ? (data.recent_comments as CommentItem[]) : []
        if (!mounted) return
        commentsCache.set(slug, c)
        setComments(c)
      } catch {
        if (mounted) setComments([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    run()
    return () => {
      mounted = false
      controller.abort()
    }
  }, [slug])

  if (loading) {
    return (
      <Card className="rounded-2xl shadow">
        <CardContent className="p-6 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-4">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return <CommentsList comments={comments || []} clampPx={160} />
}
