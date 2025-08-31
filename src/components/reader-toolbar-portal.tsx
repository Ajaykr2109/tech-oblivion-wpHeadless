"use client"
import React from 'react'

import ReaderToolbar from '@/components/reader-toolbar'

export default function ReaderToolbarPortal() {
  const [collapsed, setCollapsed] = React.useState(false)
  // no persistence across pages; default expanded on each post load
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[72] print:hidden">
      {!collapsed ? (
        <div className="flex items-center gap-2">
          <ReaderToolbar />
          <button
            type="button"
            aria-label="Hide reader toolbar"
            onClick={() => setCollapsed(true)}
            className="rounded-full border bg-card/80 backdrop-blur px-2 py-1 text-xs shadow"
            title="Hide"
          >
            ▾
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-label="Show reader toolbar"
          onClick={() => setCollapsed(false)}
          className="rounded-full border bg-card/80 backdrop-blur px-2 py-1 text-xs shadow"
          title="Show reader toolbar"
        >
          ▴
        </button>
      )}
    </div>
  )
}
