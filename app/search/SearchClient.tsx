"use client"

import Link from 'next/link'
import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostCard } from '@/components/post-card'
import { htmlToText } from '@/lib/text'
import { calculatePostReadingTime, formatReadingTime } from '@/lib/reading-time'

type SearchResult = {
  type: 'post' | 'user' | 'profile'
  id: number
  title: string
  excerpt?: string
  slug: string
  url: string
  authorName?: string
  featuredImage?: string
  date?: string
}

type EnhancedResponse = { results: SearchResult[]; total: number; query: string }

async function fetchSearch(q: string) {
  const r = await fetch(`/api/search/enhanced?q=${encodeURIComponent(q)}&limit=30`, { cache: 'no-store' })
  if (!r.ok) throw new Error('Failed')
  return (await r.json()) as EnhancedResponse
}

export default function SearchClient({ q }: { q: string }) {
  const router = useRouter()
  const qTrim = (q || '').trim()

  // ESC to go back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') router.back() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])

  const enabled = qTrim.length >= 2
  const query = useQuery({ queryKey: ['enhanced-search', qTrim], queryFn: () => fetchSearch(qTrim), enabled })
  const data = useMemo(() => (query.data || { results: [], total: 0, query: qTrim }) as EnhancedResponse, [query.data, qTrim])
  const posts = useMemo(() => data.results.filter(r => r.type === 'post'), [data.results])
  const users = useMemo(() => data.results.filter(r => r.type !== 'post'), [data.results])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search</h1>
      {qTrim ? (
        <p>
          Searching for: <span className="font-medium">{qTrim}</span>
          {qTrim.length < 2 && ' (type at least 2 characters)'}
        </p>
      ) : (
        <p>Please enter a search query.</p>
      )}

      <div className="mt-6">
        {qTrim && qTrim.length < 2 && (
          <div className="text-sm text-muted-foreground">Keep typing… we’ll start searching after 2+ characters.</div>
        )}

        {enabled && query.isLoading && <p>Loading…</p>}
        {enabled && query.isError && <p className="text-red-500">Failed to load search results</p>}

        {enabled && !query.isLoading && !query.isError && (
          posts.length + users.length > 0 ? (
            <Tabs defaultValue={posts.length ? 'posts' : 'users'} className="mt-4">
              <TabsList>
                <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
                <TabsTrigger value="users">Authors ({users.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="posts">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {posts.map((p) => {
                    const readingTime = calculatePostReadingTime(p.title, p.excerpt || '')
                    return (
                      <PostCard
                        key={`p-${p.id}`}
                        layout="grid"
                        showFeatured={false}
                        post={{
                          id: String(p.id),
                          title: p.title,
                          author: p.authorName || 'Unknown',
                          avatar: '/favicon.ico',
                          imageUrl: p.featuredImage || '/favicon.ico',
                          imageHint: 'featured image',
                          excerpt: htmlToText(p.excerpt || '').slice(0, 180),
                          slug: p.slug,
                          date: p.date || '',
                          content: p.excerpt || '',
                          readingTime: formatReadingTime(readingTime),
                        }}
                      />
                    )
                  })}
                </div>
              </TabsContent>
              <TabsContent value="users">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((u) => (
                    <Link key={`u-${u.id}`} href={u.url} className="flex items-center gap-3 rounded-lg border p-4 hover:bg-secondary/50 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-secondary" />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{u.title}</div>
                        <div className="text-xs text-muted-foreground truncate">Author Profile</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">We couldn't find any results for "{qTrim}".</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
