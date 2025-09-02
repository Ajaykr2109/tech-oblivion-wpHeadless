'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type WPPost = {
  id: number
  status?: string
  title?: { rendered?: string } | string
  content?: { rendered?: string } | string
  excerpt?: { rendered?: string } | string
}

function useDebouncedCallback(fn: () => void, delay: number) {
  const t = useRef<NodeJS.Timeout | null>(null)
  return useCallback(() => {
    if (t.current) clearTimeout(t.current)
    t.current = setTimeout(fn, delay)
  }, [fn, delay])
}

export default function PostEditorTile({ postId: postIdProp, initial }: { postId?: number, initial?: { title?: string, content?: string, excerpt?: string, status?: string } }) {
  const [postId, setPostId] = useState<number | null>(postIdProp ?? null)
  const [title, setTitle] = useState(initial?.title || '')
  const [content, setContent] = useState(initial?.content || '')
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '')
  const [status, setStatus] = useState<'draft'|'pending'|'publish'|'auto-draft'|'future'|'private'|'trash'|'unknown'>(
    (initial?.status as 'draft'|'pending'|'publish'|'auto-draft'|'future'|'private'|'trash'|'unknown') || 'draft'
  )
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncHash, setLastSyncHash] = useState<string>('')

  const isDirty = useMemo(() => {
    return !!(title || content || excerpt)
  }, [title, content, excerpt])
  const currentHash = useMemo(() => JSON.stringify({ title, content, excerpt }), [title, content, excerpt])

  // Create draft automatically on first typing with small debounce
  const createDraftDebounced = useDebouncedCallback(async () => {
    if (postId || !isDirty || postIdProp) return
    try {
      setIsSaving(true)
      setError(null)
      const res = await fetch('/api/wp/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || 'Untitled draft', content, excerpt, status: 'draft' }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const j: WPPost = await res.json()
      setPostId(j.id)
      setStatus('draft')
  setLastSavedAt(Date.now())
  setLastSyncHash(currentHash)
    } catch (e: unknown) {
      setError(`Failed to create draft: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setIsSaving(false)
    }
  }, 800)

  useEffect(() => {
    if (!postId && isDirty && !postIdProp) createDraftDebounced()
  }, [postId, isDirty, createDraftDebounced, title, content, excerpt, postIdProp])

  const autosave = useCallback(async () => {
    if (!postId) return
    if (!isDirty) return
    if (currentHash === lastSyncHash) return
    try {
      setIsSaving(true)
      setError(null)
      const res = await fetch(`/api/wp/posts?id=${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, excerpt, meta: { _autosave: true } }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      setLastSavedAt(Date.now())
      setLastSyncHash(currentHash)
    } catch (e: unknown) {
      setError(`Autosave failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setIsSaving(false)
    }
  }, [postId, title, content, excerpt, isDirty, currentHash, lastSyncHash])

  // Autosave every 10s when there are changes and we have a postId
  useEffect(() => {
    if (!postId) return
    const iv = setInterval(() => {
      void autosave()
    }, 10_000)
    return () => clearInterval(iv)
  }, [postId, title, content, excerpt, autosave, isDirty, currentHash, lastSyncHash])

  const saveNow = useCallback(async () => {
    await autosave()
  }, [autosave])

  const publishRequest = useCallback(async () => {
    if (!postId) return
    try {
      setIsSaving(true)
      setError(null)
      const res = await fetch(`/api/wp/posts?id=${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      setStatus('pending')
    } catch (e: unknown) {
      setError(`Publish request failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setIsSaving(false)
    }
  }, [postId])

  const deleteDraft = useCallback(async () => {
    if (!postId) return
    try {
      setIsSaving(true)
      setError(null)
      const res = await fetch(`/api/wp/posts?id=${postId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`${res.status}`)
      // Reset editor state
      setPostId(null)
      setTitle('')
      setContent('')
      setExcerpt('')
      setStatus('draft')
      setLastSavedAt(null)
    } catch (e: unknown) {
      setError(`Delete failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setIsSaving(false)
    }
  }, [postId])

  const disabled = status === 'pending'

  return (
    <div className="h-full flex flex-col">
      <div className="mb-2 flex items-center gap-2 text-xs">
        <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{postId ? `Draft #${postId}` : 'New draft'}</span>
        <span className={`px-2 py-0.5 rounded ${status === 'pending' ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'}`}>{status}</span>
        {isSaving ? <span className="text-muted-foreground">Saving…</span> : lastSavedAt ? <span className="text-muted-foreground">Saved {new Date(lastSavedAt).toLocaleTimeString()}</span> : null}
        {error && <span className="text-red-600">{error}</span>}
        <div className="ml-auto flex gap-2">
          <button className="px-2 py-1 rounded border text-xs" onClick={saveNow} disabled={!postId || disabled || isSaving}>Save</button>
          <button className="px-2 py-1 rounded border text-xs" onClick={publishRequest} disabled={!postId || disabled || isSaving}>Request Publish</button>
          <button className="px-2 py-1 rounded border text-xs" onClick={deleteDraft} disabled={!postId || disabled || isSaving}>Delete</button>
        </div>
      </div>
      <input
        type="text"
        placeholder="Post title..."
        className="w-full mb-2 px-3 py-2 rounded border bg-background"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={saveNow}
        disabled={disabled}
      />
      <textarea
        placeholder="Write your content here..."
        className="w-full flex-1 mb-2 px-3 py-2 rounded border bg-background resize-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={saveNow}
        disabled={disabled}
      />
      <textarea
        placeholder="Excerpt (optional)"
        className="w-full px-3 py-2 rounded border bg-background resize-y"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
        onBlur={saveNow}
        disabled={disabled}
      />
      {postId && (
        <div className="mt-2 text-xs text-muted-foreground">
          Continue in full editor: <a className="underline" href={`/admin/posts/${postId}/edit`}>/admin/posts/{postId}/edit</a>
        </div>
      )}
    </div>
  )
}
