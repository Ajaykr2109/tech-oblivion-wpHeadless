"use client"
import React from 'react'

import { Button } from '@/components/ui/button'
import { RoleGate } from '@/hooks/useRoleGate'

import { useComments } from './CommentsProvider'

export default function AdminBulkBar() {
  const { selected, bulkAction, clearSelection } = useComments()
  const count = selected.size
  if (count === 0) return null
  return (
    <RoleGate action="moderateComments">
      <div className="sticky bottom-2 z-20 mx-auto max-w-3xl bg-card border rounded shadow p-2 flex items-center justify-between">
        <div className="text-sm">Selected {count} comment{count>1?'s':''}</div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => bulkAction('approve')}>Approve</Button>
          <Button size="sm" variant="secondary" onClick={() => bulkAction('unapprove')}>Unapprove</Button>
          <Button size="sm" variant="destructive" onClick={() => bulkAction('spam')}>Spam</Button>
          <Button size="sm" variant="destructive" onClick={() => bulkAction('trash')}>Trash</Button>
          <Button size="sm" onClick={() => bulkAction('restore')}>Restore</Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
        </div>
      </div>
    </RoleGate>
  )
}
