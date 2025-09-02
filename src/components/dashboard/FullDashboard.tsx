"use client"
import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Card } from '@/components/ui/card'
import { MetricsProvider, useMetrics } from '@/contexts/metrics-context'

import MetricsDashboardControls from './MetricsDashboardControls'

type LayoutItem = { i: string; x: number; y: number; w: number; h: number }
type SavedLayout = LayoutItem & { i: string }

function WidgetFrame({ title, children, actions }: { title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="h-full w-full p-3 flex flex-col gap-2 overflow-hidden">
      <div className="flex items-center justify-between text-sm">
        <div className="font-medium truncate">{title}</div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </Card>
  )
}

function MetricsWidget() {
  const { metrics, evals, evalMetric } = useMetrics()
  useEffect(() => {
    // kick off evals for pinned metrics
    metrics.filter(m => m.pinned).forEach(m => {
      if (!evals[m.id]) evalMetric(m.id)
    })
  }, [metrics, evals, evalMetric])
  const visible = metrics.filter(m => m.pinned)
  if (visible.length === 0) return <div className="text-xs text-muted-foreground">No pinned metrics.</div>
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {visible.map(m => {
        const e = evals[m.id]
        const current = e?.result?.current
        return (
          <Card key={m.id} className="p-3">
            <div className="text-xs text-muted-foreground">{m.name}</div>
            <div className="text-2xl font-semibold">{current ?? '—'}</div>
          </Card>
        )
      })}
    </div>
  )
}

function SessionsWidget() {
  const { sessionSummary, sessionTS } = useMetrics()
  const safeSessionTS = sessionTS || []
  return (
    <div className="h-full flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3"><div className="text-xs text-muted-foreground">Sessions</div><div className="text-xl font-semibold">{sessionSummary?.count ?? '—'}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">Avg Duration</div><div className="text-xl font-semibold">{sessionSummary ? Math.round(sessionSummary.avg_duration) + 's' : '—'}</div></Card>
        <Card className="p-3"><div className="text-xs text-muted-foreground">Devices</div><div className="text-xl font-semibold">{sessionSummary?.by_device?.length ?? 0}</div></Card>
      </div>
      <div className="text-xs text-muted-foreground">Timeseries points: {safeSessionTS.length}</div>
      <div className="flex-1 rounded-md border border-border/50 p-2 text-xs overflow-auto">{safeSessionTS.slice(-20).map(p => (
        <div key={p.date} className="grid grid-cols-3 gap-2"><span>{p.date}</span><span>{p.sessions}</span><span>{Math.round(p.avg_duration)}s</span></div>
      ))}</div>
    </div>
  )
}

function PresenceWidget() {
  const { presences } = useMetrics()
  const safePresences = presences || []
  if (!safePresences.length) return <div className="text-xs text-muted-foreground">No active users.</div>
  return (
    <div className="space-y-2 text-sm">
      {safePresences.map(p => (
        <div key={String(p.id)} className="flex items-center justify-between"><span>{p.name || 'User ' + p.id}</span><span className="text-muted-foreground text-xs">{p.device || 'unknown'}</span></div>
      ))}
    </div>
  )
}

function MediaWidget() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/wp/media?per_page=6')
        if (r.ok) setItems(await r.json())
      } catch {
        // Silently handle media loading errors
      }
    }
    load()
  }, [])
  if (!items.length) return <div className="text-xs text-muted-foreground">No media.</div>
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((m) => (
        <Image key={m.id} src={m.media_details?.sizes?.thumbnail?.source_url || m.source_url} width={100} height={100} className="w-full aspect-square object-cover rounded" alt={m.title?.rendered || ''} unoptimized />
      ))}
    </div>
  )
}

function Controls() { return <MetricsDashboardControls /> }

function InnerDashboard() {
  const [layout, setLayout] = useState<SavedLayout[]>([])
  const defaultLayout: SavedLayout[] = useMemo(() => ([
    { i: 'metrics', x: 0, y: 0, w: 6, h: 4 },
    { i: 'sessions', x: 6, y: 0, w: 6, h: 5 },
    { i: 'presence', x: 0, y: 4, w: 3, h: 3 },
    { i: 'media', x: 3, y: 4, w: 3, h: 3 },
  ]), [])

  useEffect(() => {
    const run = async () => {
      try {
        const r = await fetch('/api/metrics/layout', { cache: 'no-store' })
        if (r.ok) {
          const l = await r.json()
          if (Array.isArray(l) && l.length) setLayout(l)
          else setLayout(defaultLayout)
        } else setLayout(defaultLayout)
      } catch { setLayout(defaultLayout) }
    }
    run()
  }, [defaultLayout])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onLayoutChange = (l: any[]) => setLayout(l as SavedLayout[])
  // Bind layout actions on window only on client
  useEffect(() => {
    if (typeof window === 'undefined') return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__saveDashboard = async () => {
      await fetch('/api/metrics/layout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(layout) })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__resetDashboard = async () => {
      await fetch('/api/metrics/layout', { method: 'DELETE' })
      setLayout(defaultLayout)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__setDefaultDashboard = async () => {
      await fetch('/api/metrics/layout/default', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(layout) })
    }
    return () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).__saveDashboard
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).__resetDashboard
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).__setDefaultDashboard
      } catch {
        // Silently handle cleanup errors
      }
    }
  }, [layout, defaultLayout])

  const cols = 12
  const rowHeight = 48

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Dashboard</div>
        <Controls />
      </div>
      <GridLayout
        className="layout"
        cols={cols}
        rowHeight={rowHeight}
        width={1200}
        layout={layout}
        onLayoutChange={onLayoutChange}
        isResizable
        isDraggable
      >
        <div key="metrics">
          <WidgetFrame title="Metrics">
            <MetricsWidget />
          </WidgetFrame>
        </div>
        <div key="sessions">
          <WidgetFrame title="Sessions">
            <SessionsWidget />
          </WidgetFrame>
        </div>
        <div key="presence">
          <WidgetFrame title="Presence">
            <PresenceWidget />
          </WidgetFrame>
        </div>
        <div key="media">
          <WidgetFrame title="Media">
            <MediaWidget />
          </WidgetFrame>
        </div>
      </GridLayout>
    </div>
  )
}

export default function FullDashboard() {
  return (
    <MetricsProvider>
      <InnerDashboard />
    </MetricsProvider>
  )
}
