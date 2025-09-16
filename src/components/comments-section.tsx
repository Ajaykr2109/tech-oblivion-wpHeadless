"use client"
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RoleGate, useRoleGate } from '@/hooks/useRoleGate'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { decodeEntities } from '@/lib/html-entities'
// Removed likes UI per requirements

type Comment = {
  id: string | number
  author: { name: string; avatar?: string; id?: number; slug?: string }
  content: string
  createdAt: string
  // Upstream WP post ID for safety filtering— some environments were returning all comments
  postId?: number
  replies?: Comment[]
}

export default function CommentsSection({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const { allowed } = useRoleGate('comment')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sort, setSort] = useState<'new' | 'old'>('new')
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  function mapWpToComment(wpc: unknown): Comment {
    const obj = (wpc && typeof wpc === 'object') ? (wpc as Record<string, unknown>) : {}
    const name = (typeof obj.author_name === 'string' ? obj.author_name : (obj.author && typeof obj.author === 'object' && typeof (obj.author as Record<string, unknown>).name === 'string' ? (obj.author as Record<string, unknown>).name : 'Anonymous')) as string
    const avatars = (obj.author_avatar_urls && typeof obj.author_avatar_urls === 'object' ? obj.author_avatar_urls as Record<string | number, unknown> : {})
    const avatar = String(avatars['48'] || avatars[48] || avatars['96'] || avatars[96] || avatars['24'] || avatars[24] || '')
    const contentField = (obj.content && typeof obj.content === 'object' ? (obj.content as Record<string, unknown>).rendered : obj.content)
    const contentHtml = typeof contentField === 'string' ? contentField : ''
  // Strip tags and decode entities that may appear double-escaped (&amp;) in some responses
  const contentText = typeof contentHtml === 'string' ? decodeEntities(contentHtml.replace(/<[^>]*>/g, '')).trim() : ''
    const createdAt = String(obj.date || obj.date_gmt || new Date().toISOString())
    const postId = Number((obj.post as number | string | undefined) ?? (obj.post_id as number | string | undefined) ?? 0) || undefined
    return {
      id: (obj.id as string | number | undefined) ?? (obj.comment_ID as string | number | undefined) ?? String(Math.random()),
      author: { name, avatar, id: typeof obj.author === 'number' ? (obj.author as number) : undefined },
      content: contentText,
      createdAt,
      postId,
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        // Placeholder: try API if exists; otherwise empty list
        const r = await fetch(`/api/wp/comments?post=${postId}`, { cache: 'no-store' })
        if (!cancelled && r.ok) {
          const data = await r.json().catch(() => [])
          const arr = Array.isArray(data) ? data : []
          // Map early so we can filter by post id server-side safety net
          let mapped = arr.map(mapWpToComment)
          // Safety filter: some upstream responses ignored the ?post= filter returning global comments
          mapped = mapped.filter(c => !c.postId || c.postId === postId)
          
          // Enrich with author slugs in a single batch
          const ids = Array.from(new Set(mapped.map(c => c.author?.id).filter(Boolean))) as number[]
          if (ids.length) {
            try {
              const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '') || ''
              const url = `${site}/api/wp/users?include=${ids.join(',')}&per_page=${Math.min(ids.length, 100)}`
              const ur = await fetch(url, { cache: 'no-store' })
              if (ur.ok) {
        const users = await ur.json().catch(() => []) as Array<Record<string, unknown>>
                const map = new Map<number, string>()
        users.forEach(u => { if (typeof u.id === 'number' && typeof u.slug === 'string') map.set(Number(u.id), String(u.slug)) })
                setComments(mapped.map(c => ({
                  ...c,
                  author: { ...c.author, slug: c.author?.id ? map.get(c.author.id) : undefined }
                })))
              } else {
                setComments(mapped)
              }
      } catch {
        // Ignore user enrichment errors
        setComments(mapped)
      }
          } else {
            setComments(mapped)
          }
        } else if (!cancelled) {
          setComments([])
        }
    } catch {
      // Ignore comment loading errors
      if (!cancelled) setComments([])
    } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [postId])

  const filteredSorted = useMemo(() => {
    let arr = comments
    if (query.trim()) {
      const q = query.toLowerCase()
      arr = arr.filter(c => (c.author?.name || '').toLowerCase().includes(q) || (c.content || '').toLowerCase().includes(q))
    }
    const s = [...arr].sort((a,b) => (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()))
    return sort === 'new' ? s.reverse() : s
  }, [comments, sort, query])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setError(null)
    setSubmitting(true)
    try {
      const r = await fetch('/api/wp/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content })
      })
      if (r.ok) {
        setContent('')
        // Reload comments after successful post
        const j = await r.json().catch(() => null)
        // Optimistic: prepend new comment if returned, else refetch
        if (j && j.id) {
          setComments(prev => [{ 
            id: j.id, 
            author: { name: j.author_name || 'You', avatar: j.author_avatar_urls?.['48'] || '' }, 
            content: decodeEntities((j.content?.rendered || '').replace(/<[^>]*>/g, '')).trim(), 
            createdAt: j.date || new Date().toISOString(),
            postId
          }, ...prev])
        } else {
          // best-effort refetch
          try {
            const rr = await fetch(`/api/wp/comments?post=${postId}`, { cache: 'no-store' })
            const data = await rr.json().catch(() => [])
            const arr = Array.isArray(data) ? data : []
            const mapped = arr.map((d: unknown) => mapWpToComment(d)).filter(c => !c.postId || c.postId === postId)
            setComments(mapped)
          } catch {
            // TODO: implement fetch error handling
          }
        }
      } else {
        // Non-OK response: optionally we could surface an error toast; for now log.
        try {
          const errText = await r.text();
          // eslint-disable-next-line no-console
          console.error('Comment submit failed:', r.status, errText);
          setError(`Failed to post comment (${r.status}). ${errText.slice(0, 160)}`)
        } catch {/* ignore */}
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex gap-3">
        <div className="flex-1">
          <CardTitle>Comments {comments.length ? `(${comments.length})` : ''}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search comments" className="w-40 md:w-64" />
          <Select value={sort} onValueChange={(v)=>setSort(v as 'new' | 'old')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Newest first</SelectItem>
              <SelectItem value="old">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Composer */}
        <RoleGate action="comment" disabledClassName="opacity-60">
          {allowed ? (
            <form className="grid gap-3" onSubmit={onSubmit}>
              <Textarea placeholder="Write a comment..." rows={4} value={content} onChange={e=>setContent(e.target.value)} />
              {error && <div className="text-xs text-red-500" role="alert">{error}</div>}
              <div className="flex items-center justify-end gap-2">
                <Button type="submit" disabled={submitting || !content.trim()}>{submitting ? 'Posting…' : 'Post Comment'}</Button>
              </div>
            </form>
          ) : (
            <div className="text-sm text-muted-foreground">
              <Link className="text-primary hover:underline" href="/login">Log in</Link> to comment.
            </div>
          )}
        </RoleGate>

        {/* List */}
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading comments…</div>
        ) : comments.length === 0 ? (
          <div className="text-sm text-muted-foreground">No comments yet.</div>
        ) : (
          <div className="space-y-6">
            {filteredSorted.map((c) => (
              <CommentItem key={c.id} c={c} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CommentItem({ c }: { c: Comment }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8">
  <AvatarImage src={c.author?.avatar || ''} alt={c.author?.name || 'Author'} />
  <AvatarFallback>{(c.author?.name || 'A').split(' ').map(n => (n?.[0] || '')).join('').slice(0,2) || 'A'}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 text-sm font-medium">
          {c.author?.slug ? (
            <Link href={`/profile/${encodeURIComponent(c.author.slug)}`} className="hover:underline">{c.author?.name || 'Anonymous'}</Link>
          ) : (
            <span>{c.author?.name || 'Anonymous'}</span>
          )}
          <span className="text-xs text-muted-foreground">· {new Date(c.createdAt).toLocaleString()}</span>
        </div>
        <div className="text-sm text-foreground mt-1">{c.content}</div>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <button className="hover:text-foreground" type="button">Reply</button>
        </div>
        {c.replies && c.replies.length > 0 && (
          <div className="mt-3 space-y-4 border-l pl-3">
            {c.replies.map(r => (
              <CommentItem key={r.id} c={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
