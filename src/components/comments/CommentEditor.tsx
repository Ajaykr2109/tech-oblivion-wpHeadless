"use client"
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAuth, RoleGate } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'

import { useComments } from './CommentsProvider'

type Props = { parentId?: number, autoFocus?: boolean, onSubmitted?: () => void }

export default function CommentEditor({ parentId, autoFocus, onSubmitted }: Props) {
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { isLoading } = useAuth()
  const { submitComment } = useComments()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    setSubmitting(true)
    try {
      await submitComment(value.trim(), parentId)
      setValue('')
      onSubmitted?.()
    } finally { setSubmitting(false) }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    )
  }

  return (
    <RoleGate 
      action="comment" 
      hideWhenUnauthorized={false}
      fallback={
        <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded border border-dashed">
          <a href="/login" className="text-primary hover:underline">Log in</a> to comment.
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-2">
        <Textarea 
          value={value} 
          onChange={e => setValue(e.target.value)} 
          rows={parentId ? 3 : 4} 
          placeholder={parentId ? 'Write a reply…' : 'Write a comment…'} 
          autoFocus={autoFocus}
          aria-label={parentId ? 'Reply editor' : 'Comment editor'} 
        />
        <div className="flex justify-end gap-2">
          <Button type="submit" size="sm" disabled={submitting || !value.trim()} aria-label="Post">
            {submitting ? 'Posting…' : parentId ? 'Reply' : 'Post Comment'}
          </Button>
        </div>
      </form>
    </RoleGate>
  )
}
