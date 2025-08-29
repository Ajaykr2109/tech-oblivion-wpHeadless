"use client"

import { useState, useEffect } from 'react'
import { PostCard } from './post-card'
import { cn } from '@/lib/utils'

type Post = {
  id: string
  title: string
  author: string
  avatar: string
  imageUrl: string
  imageHint: string
  excerpt: string
}

export function ClientFeed({ layout = 'list', perPage = 4 }: { layout?: 'list' | 'grid', perPage?: number }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadPage(1) }, [])

  async function loadPage(p: number) {
    setLoading(true)
    try {
      const res = await fetch(`/api/wp/posts?page=${p}&perPage=${perPage}`)
      const data = await res.json()
      const mapped = data.items.map((i: any) => ({
        id: String(i.id),
        title: i.title,
        author: i.authorName || 'Unknown',
        avatar: i.authorAvatar || '/favicon.ico',
        imageUrl: i.featuredImage || '/favicon.ico',
        imageHint: i.title,
        excerpt: (i.excerptHtml || '').replace(/<[^>]+>/g, '').slice(0,240),
      }))
      if (p === 1) setPosts(mapped)
      else setPosts(prev => [...prev, ...mapped])
      setPage(p)
    } catch (e) {
      // ignore
    } finally { setLoading(false) }
  }

  const wrapperClass = cn(
    'grid gap-6',
    layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
  )

  return (
    <>
      <div className={wrapperClass}>
        {posts.map(p => <PostCard key={p.id} post={p as any} layout={layout as any} />)}
      </div>
      <div className="flex justify-center mt-6">
        <button className="btn" onClick={() => loadPage(page + 1)} disabled={loading}>{loading ? 'Loading...' : 'Load more'}</button>
      </div>
    </>
  )
}
