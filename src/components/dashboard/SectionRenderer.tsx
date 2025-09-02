"use client"

import React, { useEffect, useMemo, useState } from 'react'

import GridLayout from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Card } from '@/components/ui/card'

import { widgetRegistry, type Widget } from './WidgetRegistry'
import TileRenderer from './TileRenderer'

type SavedLayout = { i: string; x: number; y: number; w: number; h: number }

export default function SectionRenderer({ section }: { section: Widget['section'] }) {
  const widgets = useMemo(() => widgetRegistry.filter(w => w.section === section), [section])
  const defaultLayout: SavedLayout[] = useMemo(() => widgets.map(w => w.defaultLayout), [widgets])
  const [layout, setLayout] = useState<SavedLayout[]>(defaultLayout)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLayoutChange = (l: SavedLayout[]) => setLayout(l as any)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const r = await fetch('/api/metrics/layout', { cache: 'no-store' })
        if (!r.ok) throw new Error('layout load failed')
        const saved = await r.json()
        if (alive && Array.isArray(saved) && saved.length) setLayout(saved)
      } catch {
        if (alive) setLayout(defaultLayout)
      }
    })()
    return () => { alive = false }
  }, [defaultLayout])

  return (
    <div className="space-y-3">
      <GridLayout
        className="layout"
        cols={12}
        rowHeight={48}
        width={1200}
        layout={layout}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onLayoutChange={handleLayoutChange}
      >
        {widgets.map(w => (
          <div key={w.id}>
            <Card className="h-full w-full p-3 overflow-auto">
              <div className="text-sm font-medium mb-2">{w.title}</div>
              <TileRenderer widget={w} />
            </Card>
          </div>
        ))}
      </GridLayout>
    </div>
  )
}
