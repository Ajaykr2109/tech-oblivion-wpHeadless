"use client"

import { useMemo, useState } from 'react'
import { Reply, Trash2 } from 'lucide-react'

import BulkActionsBar, { BulkAction } from '@/components/admin/BulkActionsBar'
import SelectableTable from '@/components/admin/SelectableTable'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import DummyDataIndicator from '@/components/ui/dummy-data-indicator'

const dummyComments = [
 
]

export default function CommentsClient() {
  const [selected, setSelected] = useState<number[]>([])
  const header = useMemo(()=>[
    'Author', 'Comment', 'Post', 'Date', 'Actions'
  ], [])
  const rows = useMemo(()=> dummyComments.map(c => ({
    id: c.id,
    cells: [
      <div className="flex items-center gap-3" key="author">
        <Avatar>
          <AvatarImage src={c.avatar} alt={c.author} />
          <AvatarFallback>{c.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{c.author}</span>
      </div>,
      <span className="text-muted-foreground" key="text">{c.text}</span>,
      <span key="post">{c.post}</span>,
      <span key="date">{c.date}</span>,
      <div className="flex justify-end gap-2" key="actions">
        <Button variant="outline" size="sm"><Reply className="mr-2 h-4 w-4" /> Reply</Button>
        <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
      </div>
    ]
  })), [])

  const onAction = async (action: BulkAction) => {
    if (selected.length === 0) return
    const res = await fetch('/api/wp/comments/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected, action })
    })
    if (!res.ok) throw new Error('Bulk action failed')
  }

  return (
    <div>
      <div className="mb-4">
        <DummyDataIndicator 
          type="banner" 
          message="Comment data is using sample/dummy comments for demonstration purposes."
        />
      </div>
      <BulkActionsBar onAction={onAction} disabled={selected.length===0} />
      <SelectableTable rows={rows} header={header} onSelectionChange={setSelected} />
    </div>
  )
}
