"use client"

import { useMemo, useState, useCallback } from 'react'
import { Trash2, Check, X, AlertTriangle } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import BulkActionsBar, { BulkAction } from '@/components/admin/BulkActionsBar'
import SelectableTable from '@/components/admin/SelectableTable'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ToastAction } from '@/components/ui/toast'

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
  const [page, setPage] = useState<number>(1)
  const [perPage, setPerPage] = useState<number>(20)
  const queryClient = useQueryClient()
  
  type QueryResult = { items: WPComment[]; total: number; totalPages: number }
  const { data, isLoading } = useQuery<QueryResult>({
    queryKey: ['admin-comments', statusFilter, page, perPage],
    queryFn: async () => {
      if (statusFilter === 'all') {
        // For 'all', fetch all statuses separately since WordPress excludes spam/trash from status=all
        const [approvedRes, holdRes, spamRes, trashRes] = await Promise.all([
          fetch('/api/comments?auth=basic&status=approved&per_page=100&orderby=date&order=desc', { cache: 'no-store' }),
          fetch('/api/comments?auth=basic&status=hold&per_page=100&orderby=date&order=desc', { cache: 'no-store' }),
          fetch('/api/comments?auth=basic&status=spam&per_page=100&orderby=date&order=desc', { cache: 'no-store' }),
          fetch('/api/comments?auth=basic&status=trash&per_page=100&orderby=date&order=desc', { cache: 'no-store' })
        ])
        
        if (!approvedRes.ok || !holdRes.ok || !spamRes.ok || !trashRes.ok) {
          throw new Error('Failed to fetch comments')
        }
        
        const [approved, hold, spam, trash] = await Promise.all([
          approvedRes.json(),
          holdRes.json(),
          spamRes.json(),
          trashRes.json()
        ])
        
        // Combine and sort all comments
        const allComments = [...approved, ...hold, ...spam, ...trash]
        const sortedComments = allComments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        
        // Implement client-side pagination
        const total = sortedComments.length
        const totalPages = Math.ceil(total / perPage)
        const startIndex = (page - 1) * perPage
        const items = sortedComments.slice(startIndex, startIndex + perPage)
        
        return { items, total, totalPages }
      } else {
        // For specific status, use normal API
        const url = new URL('/api/comments', window.location.origin)
        // Map UI to WP REST status values
        const map: Record<string, string> = { approved: 'approve', unapproved: 'hold', hold: 'hold', spam: 'spam', trash: 'trash' }
        url.searchParams.set('status', map[statusFilter] || statusFilter)
        url.searchParams.set('page', String(page))
        url.searchParams.set('per_page', String(perPage))
        url.searchParams.set('orderby', 'date')
        url.searchParams.set('order', 'desc')
        // Add auth=basic to ensure we get privileged content
        url.searchParams.set('auth', 'basic')

        const response = await fetch(url.toString(), { cache: 'no-store' })
        if (!response.ok) throw new Error('Failed to fetch comments')
        const total = parseInt(response.headers.get('X-WP-Total') || '0', 10)
        const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10)
        const items = await response.json() as WPComment[]
        return { items, total, totalPages }
      }
    }
  })

  const comments = useMemo<WPComment[]>(() => data?.items || [], [data])
  const totalPages = data?.totalPages || 1
  const { toast } = useToast()

  const moderateComment = useCallback(async (commentId: number, action: 'approve'|'unapprove'|'spam'|'trash') => {
    // Snapshot previous data for rollback
    const queryKey = ['admin-comments', statusFilter, page, perPage] as const
    const prev = queryClient.getQueryData<QueryResult>(queryKey)
    try {
      // Optimistic UI update
      const nextStatus: Record<typeof action, WPComment['status']> = {
        approve: 'approved',
        unapprove: 'hold',
        spam: 'spam',
        trash: 'trash'
      }
      queryClient.setQueryData<QueryResult>(queryKey, (old) => {
        if (!old) return old as unknown as QueryResult
        return { ...old, items: old.items.map(c => c.id === commentId ? { ...c, status: nextStatus[action] } : c) }
      })

      const statusMap: Record<typeof action, string> = { approve: 'approve', unapprove: 'hold', spam: 'spam', trash: 'trash' }
      const response = await fetch(`/api/comments/${commentId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusMap[action] })
      })
      if (!response.ok) throw new Error('Failed to moderate comment')

      // Refetch to ensure backend state is synced (counts, pagination)
      await queryClient.invalidateQueries({ queryKey: ['admin-comments'] })

      if (action === 'trash') {
        toast({
          title: 'Moved to Trash',
          description: 'Comment moved to trash.',
          action: (
            <ToastAction altText="Undo" onClick={() => moderateComment(commentId, 'unapprove')}>
              Undo
            </ToastAction>
          ),
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error moderating comment:', error)
      // Rollback UI to previous state
      if (prev) queryClient.setQueryData<QueryResult>(queryKey, prev)
      toast({ title: 'Action failed', description: 'Could not update comment. Please try again.', variant: 'destructive' })
    }
  }, [queryClient, statusFilter, page, perPage, toast])
  
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
        <span key="status" className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium w-fit
          ${c.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : ''}
          ${c.status === 'hold' || c.status === 'unapproved' ? 'bg-amber-100 text-amber-800 border border-amber-200' : ''}
          ${c.status === 'spam' ? 'bg-red-100 text-red-800 border border-red-200' : ''}
          ${c.status === 'trash' ? 'bg-gray-100 text-gray-700 border border-gray-200' : ''}
        `}>
          <StatusIcon className="h-3 w-3" /> {statusInfo.label}
        </span>,
        <span key="date">{new Date(c.date).toLocaleDateString()}</span>,
        <div className="flex justify-end gap-2" key="actions">
          {c.status !== 'approved' && c.status !== 'spam' && c.status !== 'trash' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => moderateComment(c.id, 'approve')}
            >
              <Check className="mr-2 h-4 w-4" /> Approve
            </Button>
          )}
          {c.status === 'approved' && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => moderateComment(c.id, 'unapprove')}
            >
              <X className="mr-2 h-4 w-4" /> Unapprove
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
    // counts per tab are best fetched server-side; as a quick approximation, count from current page
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
    <div className="flex flex-col min-h-[calc(100vh-160px)]">

      <Tabs value={statusFilter} onValueChange={(v)=>{ setStatusFilter(v); setPage(1) }} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({commentCounts.all})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({commentCounts.approved})</TabsTrigger>
          <TabsTrigger value="unapproved">Pending ({commentCounts.unapproved})</TabsTrigger>
          <TabsTrigger value="spam">Spam ({commentCounts.spam})</TabsTrigger>
          <TabsTrigger value="trash">Trash ({commentCounts.trash})</TabsTrigger>
        </TabsList>
      </Tabs>

      <BulkActionsBar onAction={onAction} disabled={selected.length===0} actions={['approve', 'unapprove', 'spam', 'trash']} />
      <SelectableTable
        rows={rows}
        header={header}
        onSelectionChange={setSelected}
        maxHeight={`calc(100vh - 320px)`}
        rowStates={Object.fromEntries(comments.map(c => [c.id, c.status === 'trash' ? 'trash' : 'normal']))}
        onRowActivate={(id) => console.debug('Open comment', id)}
      />

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Per page</span>
          <select
            className="h-8 rounded border bg-background px-2 text-sm"
            value={perPage}
            onChange={(e)=>{ setPerPage(parseInt(e.target.value, 10)); setPage(1) }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 rounded border px-3 text-sm disabled:opacity-50" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1, p-1))}>Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <button className="h-8 rounded border px-3 text-sm disabled:opacity-50" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages, p+1))}>Next</button>
        </div>
      </div>
    </div>
  )
}
