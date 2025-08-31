"use client"

import { useMemo, useState } from 'react'
import { Reply, Trash2 } from 'lucide-react'

import BulkActionsBar, { BulkAction } from '@/components/admin/BulkActionsBar'
import { TableCell } from '@/components/ui/table'
import SelectableTable from '@/components/admin/SelectableTable'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const dummyComments = [
  { id: 1, author: "Alex Johnson", avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d", text: "This was an incredibly insightful article. The section on server components really cleared things up for me. Thanks!", post: "A Deep Dive into React Server Components", date: "2024-07-29" },
  { id: 2, author: "Maria Garcia", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026703d", text: "I'm not sure I agree with point number 3. Have you considered the performance implications on larger-scale applications?", post: "The Future of AI in Web Development", date: "2024-07-28" },
  { id: 3, author: "Sam Lee", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d", text: "Great post! Do you have a GitHub repository with the code examples?", post: "Mastering Tailwind CSS for Modern UIs", date: "2024-07-28" },
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
      <BulkActionsBar onAction={onAction} disabled={selected.length===0} />
      <SelectableTable rows={rows} header={header} onSelectionChange={setSelected} />
    </div>
  )
}
