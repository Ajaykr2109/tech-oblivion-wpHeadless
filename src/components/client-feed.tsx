"use client"

import { useState, useEffect } from 'react'
import { PostCard } from './post-card'
import { cn } from '@/lib/utils'
import { getPosts, type WordPressPost } from '@/lib/wordpress-client'

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
      const data = await getPosts({ page: p, per_page: perPage })
      const mapped = data.posts.map((post: WordPressPost) => ({
        id: String(post.id),
        title: post.title.rendered,
        author: 'Tech Oblivion',
        avatar: '/favicon.ico',
        imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/favicon.ico',
        imageHint: post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || post.title.rendered,
        excerpt: post.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0,240),
      }))
      if (p === 1) setPosts(mapped)
      else setPosts(prev => [...prev, ...mapped])
      setPage(p)
    } catch (e) {
      console.error('Error loading posts:', e)
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
