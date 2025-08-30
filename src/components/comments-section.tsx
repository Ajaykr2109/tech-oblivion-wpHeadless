"use client"
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { RoleGate, useRoleGate } from '@/hooks/useRoleGate'

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
          setComments(Array.isArray(data) ? data : [])
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments {comments.length ? `(${comments.length})` : ''}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Composer */}
        <RoleGate action="comment" disabledClassName="opacity-60">
          {allowed ? (
            <form className="grid gap-3">
              <Textarea placeholder="Write a comment..." rows={4} />
              <div className="flex items-center justify-end gap-2">
                <Button type="submit">Post Comment</Button>
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
            {comments.map((c) => (
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
        <AvatarImage src={c.author.avatar || ''} alt={c.author.name} />
        <AvatarFallback>{c.author.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="text-sm font-medium">{c.author.name} <span className="text-xs text-muted-foreground">· {new Date(c.createdAt).toLocaleString()}</span></div>
        <div className="text-sm text-foreground mt-1">{c.content}</div>
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
