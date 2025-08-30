"use client"
import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { RoleGate, useRoleGate } from '@/hooks/useRoleGate'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// Removed likes UI per requirements

type Comment = {
  id: string | number
  author: { name: string; avatar?: string }
  content: string
  createdAt: string
  replies?: Comment[]
}

export default function CommentsSection({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { allowed } = useRoleGate('comment')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sort, setSort] = useState<'new' | 'old'>('new')
  const [query, setQuery] = useState('')

  function mapWpToComment(wpc: any): Comment {
    const name = (wpc?.author_name || wpc?.author?.name || 'Anonymous') as string
    const avatars = wpc?.author_avatar_urls || {}
    const avatar = avatars['48'] || avatars[48] || avatars['96'] || avatars[96] || avatars['24'] || avatars[24] || ''
    const contentHtml = (wpc?.content?.rendered ?? wpc?.content ?? '') as string
    const contentText = typeof contentHtml === 'string' ? contentHtml.replace(/<[^>]*>/g, '').trim() : ''
    const createdAt = (wpc?.date || wpc?.date_gmt || new Date().toISOString()) as string
    return {
      id: wpc?.id ?? wpc?.comment_ID ?? String(Math.random()),
      author: { name, avatar },
      content: contentText,
      createdAt,
    }
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        // Placeholder: try API if exists; otherwise empty list
        const r = await fetch(`/api/wp/comments?post=${postId}`, { cache: 'no-store' })
        if (!cancelled && r.ok) {
          const data = await r.json().catch(() => [])
          const arr = Array.isArray(data) ? data : []
          setComments(arr.map(mapWpToComment))
        } else if (!cancelled) {
          setComments([])
        }
      } catch {
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
          setComments(prev => [{ id: j.id, author: { name: j.author_name || 'You', avatar: j.author_avatar_urls?.['48'] || '' }, content: (j.content?.rendered || '').replace(/<[^>]*>/g, '').trim(), createdAt: j.date || new Date().toISOString() }, ...prev])
        } else {
          // best-effort refetch
          try {
            const rr = await fetch(`/api/wp/comments?post=${postId}`, { cache: 'no-store' })
            const data = await rr.json().catch(() => [])
            const arr = Array.isArray(data) ? data : []
            setComments(arr.map((d: any) => mapWpToComment(d)))
          } catch {}
        }
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
          <Select value={sort} onValueChange={(v)=>setSort(v as any)}>
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
          <span>{c.author?.name || 'Anonymous'}</span>
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
