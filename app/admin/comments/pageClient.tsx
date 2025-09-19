"use client"

import { useMemo, useState } from 'react'
import { Reply, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import BulkActionsBar, { BulkAction } from '@/components/admin/BulkActionsBar'
import SelectableTable from '@/components/admin/SelectableTable'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface WPComment {
  id: number
  author_name: string
  author_email: string
  author_avatar_urls?: { '48'?: string }
  content: { rendered: string }
  post: number
  date: string
  status: string
}

export default function CommentsClient() {
  const [selected, setSelected] = useState<number[]>([])
  
  const { data: comments, isLoading } = useQuery<WPComment[]>({
    queryKey: ['admin-comments'],
    queryFn: async () => {
      const response = await fetch('/api/wp/comments')
      if (!response.ok) throw new Error('Failed to fetch comments')
      return response.json()
    }
  })
  
  const header = useMemo(()=>[
    'Author', 'Comment', 'Post', 'Date', 'Actions'
  ], [])
  
  const rows = useMemo(()=> (comments || []).map(c => ({
    id: c.id,
    cells: [
      <div className="flex items-center gap-3" key="author">
        <Avatar>
          <AvatarImage src={c.author_avatar_urls?.['48']} alt={c.author_name} />
          <AvatarFallback>{c.author_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <span className="font-medium">{c.author_name}</span>
          <div className="text-sm text-muted-foreground">{c.author_email}</div>
        </div>
      </div>,
      <div className="text-muted-foreground max-w-xs" key="text">
        <div dangerouslySetInnerHTML={{ __html: c.content.rendered.substring(0, 100) + '...' }} />
      </div>,
      <span key="post">Post #{c.post}</span>,
      <span key="date">{new Date(c.date).toLocaleDateString()}</span>,
      <div className="flex justify-end gap-2" key="actions">
        <Button variant="outline" size="sm"><Reply className="mr-2 h-4 w-4" /> Reply</Button>
        <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
      </div>
    ]
  })), [comments])

  const onAction = async (action: BulkAction) => {
    if (selected.length === 0) return
    const res = await fetch('/api/wp/comments/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selected, action })
    })
    if (!res.ok) throw new Error('Bulk action failed')
  }

  if (isLoading) {
    return <div className="p-6">Loading comments...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Comments Management</h2>
        <p className="text-muted-foreground">Manage and moderate user comments across your site.</p>
      </div>
      <BulkActionsBar onAction={onAction} disabled={selected.length===0} />
      <SelectableTable rows={rows} header={header} onSelectionChange={setSelected} />
    </div>
  )
}
