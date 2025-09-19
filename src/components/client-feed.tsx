"use client"

import { useState, useEffect, useCallback } from 'react'

import { cn } from '@/lib/utils'
import { htmlToText } from '@/lib/text'
// Use internal API to avoid direct browser calls to WordPress
import type { WPPost } from '@/lib/wp'

import { PostCard } from './post-card'

type Post = {
  id: string
  title: string
  author: string
  avatar: string
  imageUrl: string
  imageHint: string
  excerpt: string
  slug: string
  date: string
}

export function ClientFeed({ layout = 'list', perPage = 4 }: { layout?: 'list' | 'grid', perPage?: number }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const loadPage = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), per_page: String(perPage), _embed: '1' })
      const res = await fetch(`/api/wp/posts?${params.toString()}`)
      if (!res.ok) throw new Error(`Failed to load posts: ${res.status}`)
      const posts: WPPost[] = await res.json()
      const mapped = posts.map((post: WPPost) => ({
        id: String(post.id),
        title: post.title.rendered,
        author: 'Tech Oblivion',
        avatar: '/favicon.ico',
        imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/favicon.ico',
        imageHint: post.title.rendered,
        excerpt: htmlToText(post.excerpt.rendered).slice(0,240),
        slug: post.slug,
        date: post.date,
      }))
      if (p === 1) setPosts(mapped)
      else setPosts(prev => [...prev, ...mapped])
      setPage(p)
    } catch (e) {
      console.error('Error loading posts:', e)
    } finally { setLoading(false) }
  }, [perPage])

  useEffect(() => { loadPage(1) }, [loadPage])

  const wrapperClass = cn(
    'grid gap-6',
    layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
  )

  return (
    <>
      <div className={wrapperClass}>
        {posts.map(p => <PostCard key={p.id} post={p} layout={layout} />)}
      </div>
      <div className="flex justify-center mt-6">
        <button className="btn" onClick={() => loadPage(page + 1)} disabled={loading}>{loading ? 'Loading...' : 'Load more'}</button>
      </div>
    </>
  )
}
