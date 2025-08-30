"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ClientImage from '@/components/ui/client-image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { decodeEntities, htmlToText } from '@/lib/text'

type WPPost = any
type WPComment = any

export default function AuthorActivity({ authorId }: { authorId: number }) {
  const [posts, setPosts] = useState<WPPost[]>([])
  const [comments, setComments] = useState<WPComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`/api/wp/posts?author=${authorId}&_embed=1&per_page=6`, { cache: 'no-store' }),
          fetch(`/api/wp/comments?author=${authorId}&per_page=6&order=desc&orderby=date`, { cache: 'no-store' }),
        ])
        const p = pRes.ok ? await pRes.json() : []
        const c = cRes.ok ? await cRes.json() : []
        if (!active) return
        setPosts(Array.isArray(p) ? p : [])
        setComments(Array.isArray(c) ? c : [])
      } catch {
        if (!active) return
        setPosts([])
        setComments([])
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [authorId])

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-3">Recent Posts</h2>
        {loading && posts.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">No posts yet.</div>
        ) : (
          <div className="space-y-4">
            {posts.slice(0, 6).map((p: any) => (
              <Card key={p.id} className="bg-card/50">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base"><Link href={`/blog/${p.slug}`}>{decodeEntities(p.title?.rendered || p.title || '')}</Link></CardTitle>
                  <CardDescription>{new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex gap-3">
                    <div className="relative w-20 h-14 flex-shrink-0">
                      <ClientImage src={p._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/favicon.ico'} alt={decodeEntities(p.title?.rendered || p.title || '')} fill className="object-cover rounded" sizes="80px" />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{htmlToText(p.excerpt?.rendered || '').slice(0, 160)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-3">Recent Comments</h2>
        {loading && comments.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">Loading…</div>
        ) : comments.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">No comments yet.</div>
        ) : (
          <div className="space-y-4">
            {comments.slice(0, 6).map((c: any) => (
              <Card key={c.id} className="bg-card/50">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">On post #{c.post}</CardTitle>
                  <CardDescription>{new Date(c.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm" dangerouslySetInnerHTML={{ __html: c.content?.rendered || '' }} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
