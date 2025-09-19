"use client"
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { decodeEntities } from '@/lib/html-entities'
import { useAuth } from '@/hooks/useAuth'

import type { CommentsContextValue, CommentsState, CommentModel, SortMode } from './types'

function stripHtml(input: string): string {
  return decodeEntities(input.replace(/<[^>]*>/g, '')).trim()
}

function mapWp(c: unknown): CommentModel {
  const obj = (c && typeof c === 'object') ? (c as Record<string, unknown>) : {}
  const avatars = (obj['author_avatar_urls'] && typeof obj['author_avatar_urls'] === 'object') ? obj['author_avatar_urls'] as Record<string | number, unknown> : {}
  const avatar = String(avatars['48'] || avatars[48] || avatars['96'] || avatars[96] || '')
  const contentField = (obj['content'] && typeof obj['content'] === 'object') ? (obj['content'] as Record<string, unknown>)['rendered'] : obj['content']
  const contentHtml = typeof contentField === 'string' ? contentField : ''
  const parent = (typeof obj['parent'] === 'number' && (obj['parent'] as number) > 0) ? (obj['parent'] as number) : undefined
  // Normalize WP REST status values to our CommentModel
  const rawStatus = typeof obj['status'] === 'string' ? (obj['status'] as string) : 'approve'
  const statusVal = (rawStatus === 'approve') ? 'approved' : rawStatus
  return {
    id: (obj['id'] as number | string | undefined) ?? Math.random().toString(36).slice(2),
    postId: Number(obj['post'] ?? obj['post_id'] ?? 0),
    parentId: parent,
    author: {
      id: typeof obj['author'] === 'number' ? (obj['author'] as number) : undefined,
      name: (obj['author_name'] as string) || ((obj['author'] && typeof obj['author'] === 'object' && typeof (obj['author'] as Record<string, unknown>)['name'] === 'string') ? String((obj['author'] as Record<string, unknown>)['name']) : 'Anonymous'),
      slug: typeof obj['author_slug'] === 'string' ? (obj['author_slug'] as string) : undefined,
      avatar,
    },
    content: stripHtml(String(contentHtml)),
    createdAt: String(obj['date'] || obj['date_gmt'] || new Date().toISOString()),
    status: statusVal as CommentModel['status'],
    replyCount: typeof obj['replies_count'] === 'number' ? (obj['replies_count'] as number) : undefined,
    likes: typeof obj['likes'] === 'number' ? (obj['likes'] as number) : undefined,
    likedByMe: Boolean(obj['likedByMe']),
    edited: Boolean(obj['edited'])
  }
}

type ProviderProps = React.PropsWithChildren<{ postId: number, pageSize?: number, status?: 'approved'|'pending'|'spam'|'trash'|'all' }>

const Ctx = createContext<CommentsContextValue | null>(null)

export function CommentsProvider({ children, postId, pageSize = 10, status = 'all' }: ProviderProps) {
  const { user } = useAuth()
  const [state, setState] = useState<CommentsState>({
    postId,
    items: [],
    loading: true,
    error: null,
    page: 1,
    pageSize,
    hasMore: true,
    expanded: new Set(),
    selected: new Set(),
    sort: 'new',
    query: '',
  })

  const cacheKey = useMemo(() => `comments:state:${postId}`, [postId])
  const prefetched = useRef<Set<string | number>>(new Set())

  // Restore persisted UI state
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(cacheKey)
      if (raw) {
        const saved = JSON.parse(raw)
        setState(prev => ({ ...prev, sort: saved.sort || prev.sort, query: saved.query || '', expanded: new Set(saved.expanded || [] as (string|number)[]) }))
      }
    } catch {
      // ignore restore errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey])

  useEffect(() => {
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ sort: state.sort, query: state.query, expanded: Array.from(state.expanded) }))
    } catch {
      // ignore persist errors
    }
  }, [cacheKey, state.sort, state.query, state.expanded])

  const fetchPage = useCallback(async (page: number) => {
    const qs = new URLSearchParams({ post: String(postId), per_page: String(state.pageSize), page: String(page), order: 'desc', orderby: 'date' })
    // Map friendly status to WP REST values
    const statusMap: Record<string, string> = { approved: 'approve', pending: 'hold', spam: 'spam', trash: 'trash', all: 'all' }
    const mappedStatus = statusMap[status]
    if (mappedStatus && mappedStatus !== 'all') qs.set('status', mappedStatus)
    const endpoint = '/api/wp/comments'
    console.log(`Fetching comments for post ${postId} with params:`, qs.toString())
    const r = await fetch(`${endpoint}?${qs.toString()}`, { cache: 'no-store' })
    if (!r.ok) throw new Error(`Failed to load comments: ${r.status}`)
    const data = await r.json().catch(() => [])
    console.log(`Comments API returned ${Array.isArray(data) ? data.length : 0} comments for post ${postId}`)
    // Filter to only comments for this specific post and exclude replies (they'll be loaded separately)
    const mapped: CommentModel[] = Array.isArray(data) ? data.map(mapWp).filter(c => !c.parentId && c.postId === postId) : []
    console.log(`Filtered to ${mapped.length} top-level comments for post ${postId}`)
    return mapped
  }, [postId, state.pageSize, status])

  const loadInitial = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const items = await fetchPage(1)
      setState(s => ({ ...s, items, page: 1, hasMore: items.length === s.pageSize, loading: false }))
    } catch (e: unknown) {
      const msg = (e instanceof Error ? e.message : 'Failed to load comments')
      setState(s => ({ ...s, loading: false, error: msg }))
    }
  }, [fetchPage])

  useEffect(() => { loadInitial() }, [loadInitial])

  const loadMoreTop = useCallback(async () => {
    if (!state.hasMore || state.loading) return
    setState(s => ({ ...s, loading: true }))
    try {
      const next = state.page + 1
      const items = await fetchPage(next)
      setState(s => ({ ...s, items: [...s.items, ...items], page: next, hasMore: items.length === s.pageSize, loading: false }))
    } catch (e: unknown) {
      const msg = (e instanceof Error ? e.message : 'Failed to load more comments')
      setState(s => ({ ...s, loading: false, error: msg }))
    }
  }, [state.hasMore, state.loading, state.page, fetchPage])

  const loadReplies = useCallback(async (id: string | number) => {
    const qs = new URLSearchParams({ post: String(postId), per_page: '50', order: 'asc', orderby: 'date', parent: String(id) })
    const r = await fetch(`/api/wp/comments?${qs.toString()}`, { cache: 'no-store' })
    if (!r.ok) return [] as CommentModel[]
    const data = await r.json().catch(() => [])
    const mapped: CommentModel[] = Array.isArray(data) ? data.map(mapWp).filter(c => c.postId === postId && c.parentId === Number(id)) : []
    return mapped
  }, [postId])

  const mapNested = useCallback((items: CommentModel[], id: string | number, apply: (c: CommentModel) => CommentModel): CommentModel[] => {
    return items.map(it => {
      if (it.id === id) return apply(it)
      const reps = it.replies && it.replies.length ? mapNested(it.replies, id, apply) : it.replies
      return reps === it.replies ? it : { ...it, replies: reps }
    })
  }, [])

  const toggleExpand = useCallback(async (id: string | number) => {
    setState(s => {
      const expanded = new Set(s.expanded)
      if (expanded.has(id)) expanded.delete(id); else expanded.add(id)
      return { ...s, expanded }
    })
    // Load replies on first expand
    if (!prefetched.current.has(id)) {
      const replies = await loadReplies(id)
      prefetched.current.add(id)
      setState(s => ({ ...s, items: mapNested(s.items, id, (c) => ({ ...c, replies, repliesLoaded: true })) }))
    }
  }, [loadReplies, mapNested])

  const prefetchReplies = useCallback((id: string | number) => {
    if (prefetched.current.has(id)) return
    loadReplies(id).then(replies => {
      prefetched.current.add(id)
      setState(s => ({ ...s, items: mapNested(s.items, id, (c) => ({ ...c, replies, repliesLoaded: true })) }))
    }).catch(() => {
      // prefetch failed
    })
  }, [loadReplies, mapNested])

  const submitComment = useCallback(async (content: string, parentId?: number) => {
    const payload = { postId, content, parent: parentId }
    // optimistic
    const tempId = `temp_${Date.now()}`
    const optimistic: CommentModel = {
      id: tempId,
      postId,
      parentId: parentId ?? undefined,
      author: { name: user ? 'You' : 'Anonymous', slug: undefined, avatar: '' },
      content,
      createdAt: new Date().toISOString(),
      // Newly submitted comments should default to pending moderation unless auto-approve is active upstream
      status: 'hold',
      replies: [],
    }
    if (!parentId) {
      setState(s => ({ ...s, items: [optimistic, ...s.items] }))
    } else {
      setState(s => ({ ...s, items: s.items.map(it => it.id === parentId ? { ...it, replies: [optimistic, ...(it.replies || [])] } : it) }))
    }
    try {
      const r = await fetch('/api/wp/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!r.ok) throw new Error('Failed to post')
      const j = await r.json().catch(() => null)
      const mapped = j ? mapWp(j) : null
      if (mapped) {
        setState(s => ({
          ...s,
          items: s.items.map(it => it.id === tempId ? mapped : (it.id === parentId ? { ...it, replies: (it.replies || []).map(rp => rp.id === tempId ? mapped : rp) } : it))
        }))
      }
    } catch (e) {
      // rollback
      setState(s => ({
        ...s,
        items: parentId ? s.items.map(it => it.id === parentId ? { ...it, replies: (it.replies || []).filter(rp => rp.id !== tempId) } : it) : s.items.filter(it => it.id !== tempId)
      }))
      throw e
    }
  }, [postId, user])

  const editComment = useCallback(async (id: string | number, content: string) => {
    try {
      // Placeholder: simulate edit via local update; upstream API for editing can be added similarly
      setState(s => ({ ...s, items: s.items.map(it => it.id === id ? { ...it, content, edited: true } : { ...it, replies: (it.replies || []).map(rp => rp.id === id ? { ...rp, content, edited: true } : rp) }) }))
      return true
    } catch { return false }
  }, [])

  const deleteOwnComment = useCallback(async (id: string | number) => {
    try {
      // Soft delete display only
      setState(s => ({ ...s, items: s.items.map(it => it.id === id ? { ...it, content: 'Comment deleted by user', status: 'deleted' } : { ...it, replies: (it.replies || []).map(rp => rp.id === id ? { ...rp, content: 'Comment deleted by user', status: 'deleted' } : rp) }) }))
      return true
    } catch { return false }
  }, [])

  const markSpam = useCallback(async (id: string | number) => {
    try {
      const r = await fetch(`/api/wp/comments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'spam' }) })
      if (r.ok) {
        setState(s => ({ ...s, items: s.items.map(it => it.id === id ? { ...it, status: 'spam' } : it) }))
        return true
      }
      return false
    } catch { return false }
  }, [])

  const moderate = useCallback(async (id: string | number, action: 'approve'|'unapprove'|'restore'|'trash') => {
    try {
      const map: Record<string, string> = { approve: 'approve', unapprove: 'unapprove', restore: 'restore', trash: 'trash' }
      const r = await fetch(`/api/wp/comments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: map[action] }) })
      if (r.ok) {
        // reflect local status immediately
        const newStatus: Record<typeof action, CommentModel['status']> = {
          approve: 'approved',
          unapprove: 'hold',
          restore: 'approved',
          trash: 'trash',
        } as const
        setState(s => ({ ...s, items: s.items.map(it => it.id === id ? { ...it, status: newStatus[action] } : { ...it, replies: (it.replies||[]).map(rp => rp.id === id ? { ...rp, status: newStatus[action] } : rp) }) }))
        return true
      }
      return false
    } catch { return false }
  }, [])

  const vote = useCallback(async (id: string | number, like: boolean) => {
    // Optimistic like toggle
    setState(s => ({ ...s, items: s.items.map(it => it.id === id ? { ...it, likes: (it.likes || 0) + (like ? 1 : -1), likedByMe: like } : it) }))
    try {
      await fetch('/api/comments/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, like }) })
    } catch {
      // vote fire-and-forget
    }
  }, [])

  const setSort = useCallback((s: SortMode) => setState(prev => ({ ...prev, sort: s })), [])
  const setQuery = useCallback((q: string) => setState(prev => ({ ...prev, query: q })), [])

  const toggleSelect = useCallback((id: string | number) => {
    setState(prev => {
      const selected = new Set(prev.selected)
      if (selected.has(id)) selected.delete(id)
      else selected.add(id)
      return { ...prev, selected }
    })
  }, [])
  const clearSelection = useCallback(() => setState(prev => ({ ...prev, selected: new Set() })), [])

  const bulkAction = useCallback(async (action: 'approve'|'unapprove'|'spam'|'trash'|'restore'|'delete') => {
    const ids = Array.from(state.selected)
    if (ids.length === 0) return
    try {
      await fetch('/api/wp/comments/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ comment_ids: ids, action }) })
      // Reflect minimal local changes
      setState(s => ({ ...s, items: s.items.filter(it => !(action === 'delete' && ids.includes(it.id))), selected: new Set() }))
    } catch {
      // bulk action failed
    }
  }, [state.selected])

  const value: CommentsContextValue = useMemo(() => ({
    ...state,
    loadInitial,
    loadMoreTop,
    toggleExpand,
    prefetchReplies,
    submitComment,
    editComment,
    deleteOwnComment,
    markSpam,
    vote,
  moderate,
    setSort,
    setQuery,
    toggleSelect,
    clearSelection,
    bulkAction,
  }), [state, loadInitial, loadMoreTop, toggleExpand, prefetchReplies, submitComment, editComment, deleteOwnComment, markSpam, vote, moderate, setSort, setQuery, toggleSelect, clearSelection, bulkAction])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useComments() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useComments must be used within CommentsProvider')
  return ctx
}
