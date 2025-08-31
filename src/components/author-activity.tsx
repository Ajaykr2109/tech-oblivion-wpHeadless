"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import ClientImage from '@/components/ui/client-image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { decodeEntities, htmlToText } from '@/lib/text'

type WPPost = any
type WPComment = any

export default function AuthorActivity({ authorId }: { authorId: number }) {
  const [posts, setPosts] = useState<WPPost[]>([])
  const [comments, setComments] = useState<WPComment[]>([])
  const [postIndex, setPostIndex] = useState<Record<number, { slug?: string; title?: string }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`/api/wp/posts?author=${authorId}&_embed=1&per_page=6`, { cache: 'no-store' }),
          fetch(`/api/wp/comments?user_id=${authorId}&per_page=6&order=desc&orderby=date&_embed=1`, { cache: 'no-store' }),
        ])
        const p = pRes.ok ? await pRes.json() : []
        const c = cRes.ok ? await cRes.json() : []
        if (!active) return
        setPosts(Array.isArray(p) ? p : [])
        const clist = Array.isArray(c) ? c : []
        setComments(clist)

        // Resolve post titles/slugs for comments via a single include query
        const ids = Array.from(new Set((clist || []).map((cm: any) => Number(cm?.post)).filter(Boolean)))
        if (ids.length) {
          try {
            const inc = await fetch(`/api/wp/posts?include=${ids.join(',')}&per_page=${ids.length}`, { cache: 'no-store' })
            if (inc.ok) {
              const plist = await inc.json()
              const idx: Record<number, { slug?: string; title?: string }> = {}
              if (Array.isArray(plist)) {
                for (const it of plist) {
                  if (it?.id) idx[Number(it.id)] = { slug: it.slug, title: decodeEntities(it?.title?.rendered || it?.title || '') }
                }
              }
              if (active) setPostIndex(idx)
            }
          } catch {}
        } else {
          if (active) setPostIndex({})
        }
      } catch {
        if (!active) return
        setPosts([])
        setComments([])
        setPostIndex({})
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
            {comments.slice(0, 6).map((c: any) => {
              const meta = postIndex[Number(c.post)] || {}
              const postTitle = meta.title || `Post #${c.post}`
              const href = meta.slug ? `/blog/${meta.slug}` : undefined
              const full = htmlToText(c?.content?.rendered || '').trim()
              const heading = full.slice(0, 120)
              const rest = full.length > 120 ? full.slice(120, 320) : ''
              return (
                <Card key={c.id} className="bg-card/60 border-l-4 border-primary">
                  <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-block text-[10px] uppercase tracking-wide text-primary/90 bg-primary/10 rounded px-1.5 py-0.5">Recent</span>
                        <CardDescription className="mt-0">{new Date(c.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</CardDescription>
                      </div>
                      <CardTitle className="text-base">
                        {heading || '—'}
                      </CardTitle>
                      <CardDescription className="truncate">
                        {href ? <Link href={href} className="hover:underline">On: {postTitle}</Link> : <>On: {postTitle}</>}
                      </CardDescription>
                    </div>
                    {href && (
                      <Link href={`${href}#comment-${c.id}`} aria-label={`View on ${postTitle}`} className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-1">
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    )}
                  </CardHeader>
                  {rest && (
                    <CardContent className="p-4 pt-0 text-sm text-foreground/80">{rest}</CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
