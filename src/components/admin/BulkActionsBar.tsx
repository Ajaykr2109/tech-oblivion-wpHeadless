"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check, ShieldAlert, Slash, Trash2 } from 'lucide-react'

export type BulkAction = 'approve' | 'disapprove' | 'spam' | 'delete'

type Props = {
  onAction: (action: BulkAction) => void | Promise<void>
  disabled?: boolean
}

export default function BulkActionsBar({ onAction, disabled }: Props) {
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
  return (
    <div className="mb-4 flex gap-2">
      <Button size="sm" disabled={isBusy} onClick={() => run('approve')}><Check className="mr-2 h-4 w-4" /> Approve</Button>
      <Button size="sm" variant="secondary" disabled={isBusy} onClick={() => run('disapprove')}><Slash className="mr-2 h-4 w-4" /> Disapprove</Button>
      <Button size="sm" variant="destructive" disabled={isBusy} onClick={() => run('spam')}><ShieldAlert className="mr-2 h-4 w-4" /> Mark as Spam</Button>
      <Button size="sm" variant="destructive" disabled={isBusy} onClick={() => run('delete')}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
    </div>
  )
}
