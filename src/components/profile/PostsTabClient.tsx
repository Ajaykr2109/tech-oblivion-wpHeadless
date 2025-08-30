"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import PostsList, { PostItem } from './PostsList'

const postsCache = new Map<string, PostItem[]>()

export default function PostsTabClient({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<PostItem[] | null>(null)

  useEffect(() => {
    let mounted = true
    const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
    const cached = postsCache.get(slug)
    if (cached) {
      setPosts(cached)
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
        const p = Array.isArray(data?.recent_posts) ? (data.recent_posts as PostItem[]) : []
        if (!mounted) return
        postsCache.set(slug, p)
        setPosts(p)
      } catch {
        if (mounted) setPosts([])
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
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return <PostsList posts={posts || []} clampPx={180} />
}
