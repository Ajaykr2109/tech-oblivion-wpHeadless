"use client"

import { useState } from 'react'
import { Check, ShieldAlert, Slash, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

export type BulkAction = 'approve' | 'unapprove' | 'spam' | 'trash' | 'delete' | 'disapprove'

type Props = {
  onAction: (action: BulkAction) => void | Promise<void>
  disabled?: boolean
  actions?: BulkAction[] // Allow customizing which actions to show
}

export default function BulkActionsBar({ onAction, disabled, actions }: Props) {
  const [pending, setPending] = useState<BulkAction | null>(null)
  const run = async (action: BulkAction) => {
    try {
      setPending(action)
      await onAction(action)
    } finally {
      setPending(null)
    }
  }
  const isBusy = !!pending || disabled

  // Default actions for comments
  const defaultActions: BulkAction[] = ['approve', 'unapprove', 'spam', 'trash']
  const actionsToShow = actions || defaultActions

  return (
    <div className="mb-4 flex gap-2">
      {actionsToShow.includes('approve') && (
        <Button size="sm" disabled={isBusy} onClick={() => run('approve')}>
          <Check className="mr-2 h-4 w-4" /> Approve
        </Button>
      )}
      {actionsToShow.includes('unapprove') && (
        <Button size="sm" variant="secondary" disabled={isBusy} onClick={() => run('unapprove')}>
          <Slash className="mr-2 h-4 w-4" /> Unapprove
        </Button>
      )}
      {actionsToShow.includes('disapprove') && (
        <Button size="sm" variant="secondary" disabled={isBusy} onClick={() => run('disapprove')}>
          <Slash className="mr-2 h-4 w-4" /> Disapprove
        </Button>
      )}
      {actionsToShow.includes('spam') && (
        <Button size="sm" variant="destructive" disabled={isBusy} onClick={() => run('spam')}>
          <ShieldAlert className="mr-2 h-4 w-4" /> Mark as Spam
        </Button>
      )}
      {actionsToShow.includes('trash') && (
        <Button size="sm" variant="destructive" disabled={isBusy} onClick={() => run('trash')}>
          <Trash2 className="mr-2 h-4 w-4" /> Trash
        </Button>
      )}
      {actionsToShow.includes('delete') && (
        <Button size="sm" variant="destructive" disabled={isBusy} onClick={() => run('delete')}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      )}
    </div>
  )
}
