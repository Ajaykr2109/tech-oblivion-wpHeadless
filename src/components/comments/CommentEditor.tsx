"use client"
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RoleGate, useRoleGate } from '@/hooks/useRoleGate'

import { useComments } from './CommentsProvider'

type Props = { parentId?: number, autoFocus?: boolean, onSubmitted?: () => void }

export default function CommentEditor({ parentId, autoFocus, onSubmitted }: Props) {
  const [value, setValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { allowed } = useRoleGate('comment')
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

  return (
    <RoleGate action="comment" disabledClassName="opacity-60">
      {allowed ? (
        <form onSubmit={handleSubmit} className="grid gap-2">
          <Textarea value={value} onChange={e => setValue(e.target.value)} rows={parentId ? 3 : 4} placeholder={parentId ? 'Write a reply…' : 'Write a comment…'} autoFocus={autoFocus}
            aria-label={parentId ? 'Reply editor' : 'Comment editor'} />
          <div className="flex justify-end gap-2">
            <Button type="submit" size="sm" disabled={submitting || !value.trim()} aria-label="Post">
              {submitting ? 'Posting…' : parentId ? 'Reply' : 'Post Comment'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-sm text-muted-foreground">Log in to comment.</div>
      )}
    </RoleGate>
  )
}
