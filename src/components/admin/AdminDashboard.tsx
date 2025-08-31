'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import GridLayout from 'react-grid-layout'
import dynamic from 'next/dynamic'
import Tile from './tiles/Tile'
const PostEditorTile = dynamic(() => import('./tiles/PostEditorTile'), { ssr: false })
import { useLayoutPersistence } from '../../hooks/useLayoutPersistence'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

// Lazy heavy tiles example (actual tiles can be split per section later)
const CrewMan = dynamic(() => import('../dashboard/CrewMan'), { ssr: false })

export type SectionKey =
  | 'dashboard' | 'analytics' | 'posts' | 'media' | 'categories' | 'tags' | 'comments' | 'users' | 'settings' | 'plugins' | 'themes' | 'site-health' | 'debug'

// Default layouts provided by user
const DEFAULTS: Record<SectionKey, any[]> = {
  dashboard: [
    { i: 'postsCount', x: 0, y: 0, w: 3, h: 2 },
    { i: 'usersCount', x: 3, y: 0, w: 3, h: 2 },
    { i: 'commentsCount', x: 6, y: 0, w: 3, h: 2 },
    { i: 'sessionsToday', x: 9, y: 0, w: 3, h: 2 },
  ],
  analytics: [
    { i: 'sessionsTrend', x: 0, y: 0, w: 6, h: 4 },
    { i: 'sessionTimeseries', x: 6, y: 0, w: 6, h: 4 },
    { i: 'topCountries', x: 0, y: 4, w: 4, h: 4 },
    { i: 'devicesBreakdown', x: 4, y: 4, w: 4, h: 4 },
    { i: 'topPosts', x: 8, y: 4, w: 4, h: 4 },
    { i: 'referrers', x: 0, y: 8, w: 12, h: 3 },
  ],
  posts: [
    { i: 'latestDrafts', x: 0, y: 0, w: 6, h: 3 },
    { i: 'publishQueue', x: 6, y: 0, w: 6, h: 3 },
    { i: 'pendingReviews', x: 0, y: 3, w: 6, h: 3 },
    { i: 'addPost', x: 6, y: 3, w: 3, h: 2 },
    { i: 'postEditor', x: 0, y: 6, w: 12, h: 6 },
  ],
  media: [
    { i: 'recentUploads', x: 0, y: 0, w: 6, h: 3 },
    { i: 'storageUsage', x: 6, y: 0, w: 6, h: 2 },
    { i: 'uploadWidget', x: 0, y: 3, w: 6, h: 3 },
    { i: 'deletionsPending', x: 6, y: 2, w: 6, h: 2 },
  ],
  categories: [
    { i: 'categoriesList', x: 0, y: 0, w: 8, h: 4 },
    { i: 'addCategory', x: 8, y: 0, w: 4, h: 2 },
  ],
  tags: [
    { i: 'tagsCloud', x: 0, y: 0, w: 8, h: 4 },
    { i: 'addTag', x: 8, y: 0, w: 4, h: 2 },
  ],
  comments: [
    { i: 'commentsStream', x: 0, y: 0, w: 8, h: 4 },
    { i: 'toxicityAlerts', x: 8, y: 0, w: 4, h: 2 },
    { i: 'bulkModeration', x: 0, y: 4, w: 12, h: 3 },
  ],
  users: [
    { i: 'activeUsers', x: 0, y: 0, w: 6, h: 2 },
    { i: 'presence', x: 6, y: 0, w: 6, h: 2 },
    { i: 'roleBreakdown', x: 0, y: 2, w: 6, h: 3 },
    { i: 'inviteUser', x: 6, y: 2, w: 6, h: 2 },
  ],
  settings: [
    { i: 'siteSettings', x: 0, y: 0, w: 6, h: 3 },
    { i: 'themeToggle', x: 6, y: 0, w: 6, h: 2 },
    { i: 'apiLatency', x: 0, y: 3, w: 6, h: 2 },
    { i: 'siteHealthSummary', x: 6, y: 2, w: 6, h: 3 },
  ],
  plugins: [
    { i: 'pluginsList', x: 0, y: 0, w: 8, h: 4 },
    { i: 'updateAlerts', x: 8, y: 0, w: 4, h: 2 },
  ],
  themes: [
    { i: 'themesList', x: 0, y: 0, w: 8, h: 4 },
    { i: 'themeUpdateAlerts', x: 8, y: 0, w: 4, h: 2 },
  ],
  'site-health': [
    { i: 'healthSummary', x: 0, y: 0, w: 6, h: 3 },
    { i: 'cacheHitRate', x: 6, y: 0, w: 6, h: 2 },
    { i: 'serverInfo', x: 0, y: 3, w: 12, h: 3 },
  ],
  debug: [
    { i: 'crewMan', x: 0, y: 0, w: 12, h: 6 },
    { i: 'endpointDiscovery', x: 0, y: 6, w: 6, h: 3 },
    { i: 'logsViewer', x: 6, y: 6, w: 6, h: 3 },
  ],
}

const breakpoints = { lg: 1200, md: 996, sm: 768 }
const cols = { lg: 12, md: 8, sm: 4 }

export default function AdminDashboard({ sectionKey }: { sectionKey: SectionKey }) {
  const { loadLayout, saveLayout } = useLayoutPersistence()
  const [layout, setLayout] = useState<any[]>(DEFAULTS[sectionKey])

  // Load saved per-user layout
  useEffect(() => {
    let alive = true
    ;(async () => {
      const saved = await loadLayout(sectionKey)
  if (alive && saved?.length) setLayout(saved as any[])
      if (!saved?.length) setLayout(DEFAULTS[sectionKey])
    })()
    return () => { alive = false }
  }, [loadLayout, sectionKey])

  const onLayoutChange = useCallback((l: any[]) => {
    setLayout(l)
  }, [])

  const onLayoutSave = useCallback(async () => {
    await saveLayout(sectionKey, layout)
  }, [layout, saveLayout, sectionKey])

  // Simple placeholder tiles by id for now
  const tileIds = useMemo(() => DEFAULTS[sectionKey].map(d => d.i), [sectionKey])

  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-2 justify-end">
        <button onClick={onLayoutSave} className="px-3 py-1 text-sm rounded bg-primary text-primary-foreground">Save Layout</button>
      </div>
      <GridLayout
        className="layout"
        cols={cols.lg}
        rowHeight={48}
        width={breakpoints.lg}
        margin={[16, 16] as any}
        containerPadding={[0, 0] as any}
        onLayoutChange={onLayoutChange}
        layout={layout}
        isDraggable
        isResizable
      >
        {tileIds.map((id) => (
          <div key={id} data-grid={layout.find(l => l.i === id)}>
            <Tile>
              <div className="text-sm font-semibold mb-1">{id}</div>
              {id === 'postEditor' ? (
                <PostEditorTile />
              ) : id === 'crewMan' ? (
                <CrewMan />
              ) : (
                <div className="text-xs text-muted-foreground">Content for {id}</div>
              )}
            </Tile>
          </div>
        ))}
      </GridLayout>
    </div>
  )
}
