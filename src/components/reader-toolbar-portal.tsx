"use client"
import React from 'react'

import ReaderToolbar from '@/components/reader-toolbar'

export default function ReaderToolbarPortal() {
  // Simplified: just render the toolbar without extra collapse controls
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[72] print:hidden">
      <ReaderToolbar />
    </div>
  )
}
