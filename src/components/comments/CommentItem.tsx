"use client"
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MessageSquare, Flag, Edit3, Trash2, MoreHorizontal, CornerDownRight, ChevronDown, ChevronRight, ThumbsUp } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth, RoleGate } from '@/hooks/useAuth'

import type { CommentModel } from './types'
import { useComments } from './CommentsProvider'
import CommentEditor from './CommentEditor'

type Props = { comment: CommentModel, depth?: number }

export default function CommentItem({ comment, depth = 0 }: Props) {
  const { toggleExpand, prefetchReplies, editComment, deleteOwnComment, markSpam, vote, expanded, moderate, selected, toggleSelect } = useComments()
  const { user, can, isLoading } = useAuth()
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)
  const isExpanded = useMemo(() => expanded.has(comment.id), [expanded, comment.id])

  const canComment = can('comment')
  const isAdmin = can('moderateComments')

  // Show loading skeleton for auth-dependent content while loading
  const AuthLoadingSkeleton = () => (
    <div className="flex gap-2">
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-7 w-16" />
    </div>
  )

  const canEditOrDeleteBase = useMemo(() => {
    // Assuming user has an id field via upstream; fallback to name match
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const myName = (user as any)?.name || ''
    return myName && myName === comment.author.name
  }, [user, comment.author.name])
  const withinEditWindow = useMemo(() => {
    const created = new Date(comment.createdAt).getTime()
    const now = Date.now()
    const diffMin = (now - created) / (60 * 1000)
    return diffMin <= 10
  }, [comment.createdAt])
  const canEditOrDelete = canEditOrDeleteBase && (withinEditWindow || isAdmin)

  useEffect(() => {
    const onSubmit = (e: Event) => {
      const detail = (e as CustomEvent).detail as { value: string, parentId?: number }
      if (detail?.parentId === comment.id) setReplying(false)
    }
    window.addEventListener('comments:submit', onSubmit as EventListener)
    return () => window.removeEventListener('comments:submit', onSubmit as EventListener)
  }, [comment.id])

  const initials = (comment.author.name || 'A').split(' ').map(s => s[0]).join('').slice(0, 2)
  const isPending = comment.status && (comment.status === 'hold' || comment.status === 'unapproved')
  const muted = comment.status && (comment.status === 'spam' || isPending)

  // Hide unapproved from non-admins per requirement
  if (isPending && !isAdmin) {
    return null
  }

  return (
    <div className="flex items-start gap-3" role="article" aria-label="Comment">
      {isAdmin && (
        <input
          type="checkbox"
          aria-label="Select for bulk moderation"
          className="mt-2 h-4 w-4 accent-primary"
          checked={selected.has(comment.id)}
          onChange={() => toggleSelect(comment.id)}
        />
      )}
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src={comment.author.avatar || ''} alt={comment.author.name || 'User'} />
        <AvatarFallback>{initials || 'A'}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Link href={`/profile/${encodeURIComponent(comment.author.slug || comment.author.name || 'user')}`} className="hover:underline">{comment.author.name || 'Anonymous'}</Link>
          <span className="text-xs text-muted-foreground">· {new Date(comment.createdAt).toLocaleString()}</span>
          {comment.edited ? <span className="text-xs text-muted-foreground">(edited)</span> : null}
          {isPending && isAdmin ? <span className="text-xs text-amber-600">pending</span> : null}
        </div>

        <div className={`prose prose-sm dark:prose-invert mt-1 max-w-none ${muted ? 'opacity-70' : ''}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.content}</ReactMarkdown>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <RoleGate 
            action="comment" 
            hideWhenUnauthorized={false}
            loadingFallback={<AuthLoadingSkeleton />}
          >
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setReplying(v => !v)} aria-label="Reply">
              <MessageSquare className="h-3.5 w-3.5 mr-1" /> Reply
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => vote(comment.id, !(comment.likedByMe))} aria-pressed={comment.likedByMe} aria-label="Like">
              <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${comment.likedByMe ? 'text-primary' : ''}`} /> {comment.likes || 0}
            </Button>
          </RoleGate>

          <RoleGate 
            action="comment" 
            hideWhenUnauthorized={false}
            loadingFallback={<Skeleton className="h-7 w-16" />}
          >
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => markSpam(comment.id)} aria-label="Mark spam">
              <Flag className="h-3.5 w-3.5 mr-1" /> Spam
            </Button>
          </RoleGate>

          {canEditOrDelete && (
            <>
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setEditing(v => !v)} aria-label="Edit">
                <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => deleteOwnComment(comment.id)} aria-label="Delete">
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            </>
          )}

          <RoleGate 
            action="moderateComments" 
            hideWhenUnauthorized={true}
            loadingFallback={<Skeleton className="h-7 w-8" />}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => markSpam(comment.id)}>Mark spam</DropdownMenuItem>
                <DropdownMenuItem onClick={() => moderate(comment.id, 'approve')}>Approve</DropdownMenuItem>
                <DropdownMenuItem onClick={() => moderate(comment.id, 'unapprove')}>Unapprove</DropdownMenuItem>
                <DropdownMenuItem onClick={() => moderate(comment.id, 'restore')}>Restore</DropdownMenuItem>
                <DropdownMenuItem onClick={() => moderate(comment.id, 'trash')}>Move to trash</DropdownMenuItem>
                <DropdownMenuItem onClick={() => trustUser(comment.author.id, true)}>Trust user (auto-approve)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => trustUser(comment.author.id, false)}>Mark suspicious</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </RoleGate>
        </div>

        {editing && (
          <InlineEdit initial={comment.content} onCancel={() => setEditing(false)} onSave={async (v) => { const ok = await editComment(comment.id, v); if (ok) setEditing(false) }} />
        )}

        {replying && (
          <div className="mt-2">
            <CommentEditor parentId={Number(comment.id)} autoFocus onSubmitted={() => setReplying(false)} />
          </div>
        )}

        {/* Replies */}
        <div className="mt-2 pl-3 border-l">
          {comment.replyCount && !comment.replies?.length ? (
            <Button variant="ghost" size="sm" className="h-7 px-2" onMouseEnter={() => prefetchReplies(comment.id)} onClick={() => toggleExpand(comment.id)} aria-expanded={isExpanded} aria-controls={`replies-${comment.id}`}>
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5 mr-1" /> : <ChevronRight className="h-3.5 w-3.5 mr-1" />}
              View replies ({comment.replyCount})
            </Button>
          ) : null}
          {comment.replies && comment.replies.length > 0 && (
            <div id={`replies-${comment.id}`} className="mt-2 space-y-3">
              {comment.replies.slice(0, isExpanded ? undefined : 3).map(r => (
                <div key={r.id} className="flex items-start gap-2">
                  <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground mt-2" />
                  <div className="flex-1">
                    <CommentItem comment={r} depth={depth + 1} />
                  </div>
                </div>
              ))}
              {comment.replies.length > 3 && !isExpanded ? (
                <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => toggleExpand(comment.id)}>Show more replies</Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InlineEdit({ initial, onSave, onCancel }: { initial: string, onSave: (v: string) => void | Promise<void>, onCancel: () => void }) {
  const [v, setV] = useState(initial)
  const [busy, setBusy] = useState(false)
  return (
    <form className="mt-2 grid gap-2" onSubmit={async (e) => { e.preventDefault(); setBusy(true); await onSave(v); setBusy(false) }}>
      <textarea className="w-full rounded border bg-background p-2 text-sm" value={v} onChange={e => setV(e.target.value)} aria-label="Edit comment" />
      <div className="flex gap-2 justify-end">
        <Button type="button" size="sm" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" size="sm" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}

async function trustUser(userId: number | undefined, trusted: boolean) {
  if (!userId) return
  try {
    await fetch('/api/mod/trust-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, trusted }) })
  } catch {
    // ignore
  }
}
