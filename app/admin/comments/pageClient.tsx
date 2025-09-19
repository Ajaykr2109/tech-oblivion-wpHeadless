"use client"

import { useMemo, useState, useCallback } from 'react'
import { Trash2, Check, X, AlertTriangle } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import BulkActionsBar, { BulkAction } from '@/components/admin/BulkActionsBar'
import SelectableTable from '@/components/admin/SelectableTable'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface WPComment {
  id: number
  author_name: string
  author_email: string
  author_avatar_urls?: { '48'?: string }
  content: { rendered: string }
  post: number
  date: string
  status: 'approved' | 'unapproved' | 'spam' | 'trash' | 'hold'
}

const statusConfig = {
  approved: { label: 'Approved', variant: 'default' as const, icon: Check },
  unapproved: { label: 'Pending', variant: 'secondary' as const, icon: X },
  hold: { label: 'Pending', variant: 'secondary' as const, icon: X },
  spam: { label: 'Spam', variant: 'destructive' as const, icon: AlertTriangle },
  trash: { label: 'Trash', variant: 'outline' as const, icon: Trash2 },
}

export default function CommentsClient() {
  const [selected, setSelected] = useState<number[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const queryClient = useQueryClient()
  
  const { data: comments, isLoading } = useQuery<WPComment[]>({
    queryKey: ['admin-comments', statusFilter],
    queryFn: async () => {
      const url = new URL('/api/wp/comments', window.location.origin)
      if (statusFilter !== 'all') {
        url.searchParams.set('status', statusFilter)
      }
      url.searchParams.set('per_page', '50') // Show more comments for admin
      url.searchParams.set('orderby', 'date')
      url.searchParams.set('order', 'desc')
      
      const response = await fetch(url.toString())
      if (!response.ok) throw new Error('Failed to fetch comments')
      return response.json()
    }
  })

  const moderateComment = useCallback(async (commentId: number, action: string) => {
    try {
      const response = await fetch(`/api/wp/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      if (!response.ok) throw new Error('Failed to moderate comment')
      // Refresh the comments list
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
    } catch (error) {
      console.error('Error moderating comment:', error)
    }
  }, [queryClient])
  
  const header = useMemo(()=>[
    'Author', 'Comment', 'Post', 'Status', 'Date', 'Actions'
  ], [])
  
  const rows = useMemo(()=> (comments || []).map(c => {
    const statusInfo = statusConfig[c.status] || statusConfig.unapproved
    const StatusIcon = statusInfo.icon
    
    return {
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
        <Badge key="status" variant={statusInfo.variant} className="flex items-center gap-1 w-fit">
          <StatusIcon className="h-3 w-3" />
          {statusInfo.label}
        </Badge>,
        <span key="date">{new Date(c.date).toLocaleDateString()}</span>,
        <div className="flex justify-end gap-2" key="actions">
          {c.status !== 'approved' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => moderateComment(c.id, 'approve')}
            >
              <Check className="mr-2 h-4 w-4" /> Approve
            </Button>
          )}
          {c.status !== 'spam' && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => moderateComment(c.id, 'spam')}
            >
              <AlertTriangle className="mr-2 h-4 w-4" /> Spam
            </Button>
          )}
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => moderateComment(c.id, 'trash')}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      ]
    }
  }), [comments, moderateComment])

  const onAction = async (action: BulkAction) => {
    if (selected.length === 0) return
    try {
      const res = await fetch('/api/wp/comments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_ids: selected, action })
      })
      if (!res.ok) throw new Error('Bulk action failed')
      // Refresh the comments list and clear selection
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
      setSelected([])
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  const commentCounts = useMemo(() => {
    if (!comments) return { all: 0, approved: 0, unapproved: 0, spam: 0, trash: 0 }
    return comments.reduce((acc, comment) => {
      acc.all++
      if (comment.status === 'approved') acc.approved++
      else if (comment.status === 'unapproved' || comment.status === 'hold') acc.unapproved++
      else if (comment.status === 'spam') acc.spam++
      else if (comment.status === 'trash') acc.trash++
      return acc
    }, { all: 0, approved: 0, unapproved: 0, spam: 0, trash: 0 })
  }, [comments])

  if (isLoading) {
    return <div className="p-6">Loading comments...</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Comments Management</h2>
        <p className="text-muted-foreground">Manage and moderate user comments across your site.</p>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({commentCounts.all})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({commentCounts.approved})</TabsTrigger>
          <TabsTrigger value="unapproved">Pending ({commentCounts.unapproved})</TabsTrigger>
          <TabsTrigger value="spam">Spam ({commentCounts.spam})</TabsTrigger>
          <TabsTrigger value="trash">Trash ({commentCounts.trash})</TabsTrigger>
        </TabsList>
      </Tabs>

      <BulkActionsBar onAction={onAction} disabled={selected.length===0} actions={['approve', 'unapprove', 'spam', 'trash']} />
      <SelectableTable rows={rows} header={header} onSelectionChange={setSelected} />
    </div>
  )
}
