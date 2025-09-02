'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'

// Use a dynamic client-only wrapper to robustly resolve CJS/ESM exports
import type { Layout as RGLLayout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

interface ResponsiveGridLayoutProps {
  className?: string;
  breakpoints: { lg: number; md: number; sm: number; };
  cols: { lg: number; md: number; sm: number; };
  rowHeight: number;
  margin: number[];
  containerPadding: number[];
  onLayoutChange: (current: RGLLayout[]) => void;
  layouts: Record<string, RGLLayout[]>;
  isDraggable?: boolean;
  isResizable?: boolean;
  children?: React.ReactNode;
}

// Proper ResponsiveGridLayout wrapper for client-only usage
const ResponsiveGridLayout = dynamic(() =>
  import('react-grid-layout').then((mod: unknown) => {
    // Try both CJS and ESM default/named exports
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Responsive = (mod as any).default?.Responsive || (mod as any).Responsive;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const WidthProvider = (mod as any).default?.WidthProvider || (mod as any).WidthProvider;
    if (!Responsive || !WidthProvider) {
      throw new Error('Could not load Responsive or WidthProvider from react-grid-layout');
    }
    return WidthProvider(Responsive);
  }),
  { ssr: false }
) as React.ComponentType<ResponsiveGridLayoutProps>;

import { useLayoutPersistence } from '../../hooks/useLayoutPersistence'

import Tile from './tiles/Tile'

const PostEditorTile = dynamic(() => import('./tiles/PostEditorTile'), { ssr: false })
// Lazy heavy tiles example (actual tiles can be split per section later)
const CrewMan = dynamic(() => import('../dashboard/CrewMan'), { ssr: false })

export type SectionKey =
  | 'dashboard' | 'analytics' | 'posts' | 'media' | 'categories' | 'tags' | 'comments' | 'users' | 'settings' | 'plugins' | 'themes' | 'site-health' | 'debug'

type LayoutItem = { i: string; x: number; y: number; w: number; h: number }
// Default layouts provided by user
const DEFAULTS: Record<SectionKey, LayoutItem[]> = {
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

export default function AdminDashboard({ sectionKey }: { sectionKey?: SectionKey }) {
  const { loadLayout, saveLayout } = useLayoutPersistence()
  const validSectionKey = sectionKey || 'dashboard' // Default to 'dashboard' if undefined
  const [layout, setLayout] = useState<LayoutItem[]>(DEFAULTS[validSectionKey] || [])

  // Load saved per-user layout
  useEffect(() => {
    let alive = true
    ;(async () => {
    const saved = await loadLayout(validSectionKey)
    if (alive && Array.isArray(saved) && saved.length) setLayout(saved as LayoutItem[])
      if (!saved?.length) setLayout(DEFAULTS[validSectionKey] || [])
    })()
    return () => { alive = false }
  }, [loadLayout, validSectionKey])

  const onLayoutChange = useCallback((current: RGLLayout[]) => {
    // Only track lg layout for now; ResponsiveGridLayout supplies per-breakpoint
    const cleaned: LayoutItem[] = current.map(({ i, x, y, w, h }) => ({ i, x, y, w, h }))
    setLayout(cleaned)
  }, [])

  const onLayoutSave = useCallback(async () => {
    await saveLayout(validSectionKey, layout)
  }, [layout, saveLayout, validSectionKey])

  // Simple placeholder tiles by id for now
  const tileIds = useMemo(() => (DEFAULTS[validSectionKey] || []).map((d: LayoutItem) => d.i), [validSectionKey])

  const layouts = useMemo(() => ({
    lg: layout.map((it) => ({ ...it } as RGLLayout)),
    md: layout.map((it) => ({ ...it } as RGLLayout)),
    sm: layout.map((it) => ({ ...it } as RGLLayout)),
  }) as Record<string, RGLLayout[]>, [layout])

  return (
    <div className="p-4 space-y-3">
      <div className="flex gap-2 justify-end">
        <button onClick={onLayoutSave} className="px-3 py-1 text-sm rounded bg-primary text-primary-foreground">Save Layout</button>
      </div>
      <ResponsiveGridLayout
        className="layout"
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={48}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        onLayoutChange={onLayoutChange}
        layouts={layouts}
        isDraggable
        isResizable
      >
        {tileIds.map((id: string) => (
          <div key={id}>
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
      </ResponsiveGridLayout>
    </div>
  )
}
