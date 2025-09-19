"use client"
import React, { useEffect, useMemo } from 'react'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

import CommentItem from './CommentItem'
import { useComments } from './CommentsProvider'

export default function CommentList() {
  const { items, loading, error, hasMore, loadMoreTop, sort, setSort, query, setQuery } = useComments()

  useEffect(() => {
    const onSubmit = (e: Event) => {
      const detail = (e as CustomEvent).detail as { value: string, parentId?: number }
      if (!detail.parentId) {
        // top-level; no special handling here as provider already optimistically prepends
      }
    }
    window.addEventListener('comments:submit', onSubmit as EventListener)
    return () => window.removeEventListener('comments:submit', onSubmit as EventListener)
  }, [])

  const filteredSorted = useMemo(() => {
    let arr = items
    if (query.trim()) {
      const q = query.toLowerCase()
      arr = arr.filter(c => (c.author?.name || '').toLowerCase().includes(q) || (c.content || '').toLowerCase().includes(q))
    }
    const scored = [...arr].sort((a, b) => {
      if (sort === 'new' || sort === 'old') {
        const cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        return sort === 'new' ? -cmp : cmp
      }
      if (sort === 'mostLiked') return (b.likes || 0) - (a.likes || 0)
      if (sort === 'mostReplied') return (b.replyCount || (b.replies?.length || 0)) - (a.replyCount || (a.replies?.length || 0))
      return 0
    })
    return scored
  }, [items, sort, query])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search comments" className="w-40 md:w-64" aria-label="Search comments" />
          <Select value={sort} onValueChange={(v)=>setSort(v as typeof sort)}>
            <SelectTrigger className="w-[180px]" aria-label="Sort comments">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Newest</SelectItem>
              <SelectItem value="old">Oldest</SelectItem>
              <SelectItem value="mostLiked">Most liked</SelectItem>
              <SelectItem value="mostReplied">Most replied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="space-y-3" aria-busy="true">
          {[...Array(3)].map((_,i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {error && <div className="text-sm text-red-500" role="alert">{error}</div>}

      {filteredSorted.length === 0 && !loading ? (
        <div className="text-sm text-muted-foreground">No comments yet.</div>
      ) : (
        <div className="space-y-5">
          {filteredSorted.map(c => (
            <CommentItem key={c.id} comment={c} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button onClick={loadMoreTop} variant="secondary">Load more</Button>
        </div>
      )}
    </div>
  )
}
