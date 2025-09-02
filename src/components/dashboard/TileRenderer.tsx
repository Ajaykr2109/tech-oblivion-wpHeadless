"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

import type { Widget } from './WidgetRegistry'
import CrewMan from './CrewMan'

function NumberTile({ endpoint, pick }: { endpoint: string; pick: (j: unknown) => number | string | undefined }) {
  const [val, setVal] = useState<number | string | undefined>('—')
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const r = await fetch(endpoint, { cache: 'no-store' })
        const j = r.ok ? await r.json() : null
        if (alive) setVal(pick(j))
      } catch {
        // TODO: implement fetch error handling
      }
    })()
    return () => { alive = false }
  }, [endpoint, pick])
  return <div className="text-2xl font-semibold">{val ?? '—'}</div>
}

function ChartTile({ endpoint }: { endpoint: string }) {
  const [data, setData] = useState<unknown[]>([])
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const r = await fetch(endpoint, { cache: 'no-store' })
        const j: unknown = r.ok ? await r.json() : []
        const series = Array.isArray(j) ? j : (typeof j === 'object' && j && Array.isArray((j as Record<string, unknown>).series) ? (j as Record<string, unknown>).series as unknown[] : [])
        if (mounted) setData(series)
      } catch {
        // TODO: implement fetch error handling
      }
    })()
    return () => { mounted = false }
  }, [endpoint])
  return <pre className="text-xs overflow-auto h-full">{JSON.stringify(data.slice(-10), null, 2)}</pre>
}

type BasicRow = { id?: string | number; slug?: string; title?: string | { rendered?: string }; name?: string }
function TableTile({ endpoint, href }: { endpoint: string; href?: string }) {
  const [rows, setRows] = useState<BasicRow[]>([])
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const r = await fetch(endpoint, { cache: 'no-store' })
        const j: unknown = r.ok ? await r.json() : []
        const items: BasicRow[] = Array.isArray(j)
          ? j as BasicRow[]
          : (typeof j === 'object' && j && Array.isArray((j as Record<string, unknown>).items)
              ? ((j as Record<string, unknown>).items as BasicRow[])
              : [])
        if (mounted) setRows(items)
      } catch {
        // TODO: implement fetch error handling
      }
    })()
    return () => { mounted = false }
  }, [endpoint])
  return (
    <div className="text-sm space-y-1">
      {rows.slice(0, 8).map((row) => {
        const key = row.id ?? row.slug ?? Math.random().toString(36)
        const title = typeof row.title === 'object' ? (row.title?.rendered ?? '') : (row.title ?? row.name ?? row.slug ?? row.id)
        return (
          <div key={String(key)} className="flex items-center justify-between gap-2">
            <div className="truncate">{title as React.ReactNode}</div>
            {href && row.id ? (
              <Button asChild size="sm" variant="secondary"><Link href={`${href}/${row.id}`}>Open</Link></Button>
            ) : null}
          </div>
        )
      })}
      {!rows.length ? <div className="text-xs text-muted-foreground">No rows.</div> : null}
    </div>
  )
}

function MiniPostEditor({ endpoint }: { endpoint: string }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState<'idle' | 'saving' | 'error' | 'ok'>('idle')

  // Autosave draft every 20s if dirty
  useEffect(() => {
    const i = window.setInterval(async () => {
      if (!title && !content) return
      try {
        await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, status: 'draft' }) })
      } catch {
        // Silently handle auto-save errors
      }
    }, 20000)
    return () => window.clearInterval(i)
  }, [endpoint, title, content])

  const saveDraft = async () => {
    setSaving('saving')
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, status: 'draft' }) })
      setSaving(r.ok ? 'ok' : 'error')
    } catch { setSaving('error') }
  }
  const requestPublish = async () => {
    setSaving('saving')
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, status: 'pending' }) })
      setSaving(r.ok ? 'ok' : 'error')
    } catch { setSaving('error') }
  }
  const publishNow = async () => {
    setSaving('saving')
    try {
      const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content, status: 'publish' }) })
      setSaving(r.ok ? 'ok' : 'error')
    } catch { setSaving('error') }
  }

  return (
    <div className="space-y-2">
      <input className="w-full border rounded px-2 py-1" placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="w-full border rounded px-2 py-1 h-32" placeholder="Write your post…" value={content} onChange={(e) => setContent(e.target.value)} />
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={saveDraft} disabled={saving==='saving'}>Save Draft</Button>
        <Button size="sm" variant="secondary" onClick={requestPublish} disabled={saving==='saving'}>Request Publish</Button>
        <Button size="sm" variant="destructive" onClick={publishNow} disabled={saving==='saving'}>Publish</Button>
        <div className="text-xs text-muted-foreground">{saving==='ok' ? 'Saved' : saving==='error' ? 'Error' : null}</div>
      </div>
    </div>
  )
}

export default function TileRenderer({ widget }: { widget: Widget }) {
  const { type } = widget
  if (type === 'api_tester') return <CrewMan />
  if (type === 'tile') {
    if (widget.id === 'sessions_count') {
      return <NumberTile endpoint={widget.endpoint!} pick={(j) => (j && typeof j === 'object' ? (j as Record<string, unknown>).count as number | string | undefined : undefined)} />
    }
    if (widget.id === 'avg_duration') {
      return <NumberTile endpoint={widget.endpoint!} pick={(j) => {
        const v = j && typeof j === 'object' ? (j as Record<string, unknown>).avg_duration : undefined
        return typeof v === 'number' ? Math.round(v) + 's' : '—'
      }} />
    }
    if (widget.id.endsWith('_count') || widget.endpoint?.includes('/count')) {
      return <NumberTile endpoint={widget.endpoint!} pick={(j) => {
        if (Array.isArray(j)) return j.length
        if (j && typeof j === 'object') {
          const c = (j as Record<string, unknown>).count
          if (typeof c === 'number') return c
        }
        return '—'
      }} />
    }
    return <div className="text-xs text-muted-foreground">Tile: {widget.title}</div>
  }
  if (type === 'chart') {
    return <ChartTile endpoint={widget.endpoint!} />
  }
  if (type === 'table') {
    return <TableTile endpoint={widget.endpoint!} href={widget.href} />
  }
  if (type === 'editor') {
    return <MiniPostEditor endpoint={widget.endpoint!} />
  }
  return <div className="text-xs text-muted-foreground">Unsupported widget.</div>
}
