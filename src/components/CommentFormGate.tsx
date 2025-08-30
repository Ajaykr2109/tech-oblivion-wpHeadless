"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RoleGate, useRoleGate } from '@/hooks/useRoleGate'

export default function CommentFormGate() {
  const { allowed, reason } = useRoleGate('comment')
  return (
    <form className="grid gap-4">
      <Textarea placeholder={allowed ? "Write a comment..." : "Log in to comment."} rows={4} disabled={!allowed} />
      {!allowed && (
        <div className="text-sm text-muted-foreground">{reason} <Link href="/login" className="underline">Log in</Link></div>
      )}
      <RoleGate action="comment" as="span">
        <Button className="justify-self-end">Post Comment</Button>
      </RoleGate>
    </form>
  )
}
