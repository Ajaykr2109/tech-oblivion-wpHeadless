'use client'

import React from 'react'

import { Ribbon } from './Ribbon'
import { SidebarPosts } from './SidebarPosts'
import { ZenModeToggle } from './ZenModeToggle'
import { ThemeToggle } from './ThemeToggle'
import { ZoomSlider } from './ZoomSlider'
import { CommandPalette } from './CommandPalette'

type EditorShellProps = {
  title: React.ReactNode
  editor: React.ReactNode
  sidebarItems?: Array<{ id: string|number; title: string; status: 'Published'|'In Review'|'Draft'; pinned?: boolean }>
  onOpenItem?: (id: string|number) => void
  onCommand?: (cmd: string) => void
  counters?: { words?: number; readingMins?: number; autosave?: 'saving' | 'saved' | 'idle' }
}

export function EditorShell({ title, editor, sidebarItems = [], onOpenItem, onCommand, counters }: EditorShellProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [showSidebar, setShowSidebar] = React.useState(true)
  const [zoom, setZoom] = React.useState(100)
  const [paletteOpen, setPaletteOpen] = React.useState(false)

  const autosaveLabel = counters?.autosave === 'saving' ? 'Saving…' : counters?.autosave === 'saved' ? 'Saved' : 'Idle'

  return (
    <div className="min-h-screen flex flex-col">
      {!showSidebar && collapsed ? null : (
        <Ribbon collapsed={collapsed} onToggle={()=>setCollapsed(v=>!v)} onCommand={(c)=>{ if (c==='util:command') setPaletteOpen(true); onCommand?.(c) }} />
      )}

      <div className="border-b bg-background">
        <div className="container mx-auto px-3 py-2 flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="text-lg font-semibold truncate">{title}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground mr-2">
              {typeof counters?.words === 'number' && <span>{counters?.words} words</span>}
              {typeof counters?.readingMins === 'number' && <span>• {counters?.readingMins} min read</span>}
              <span>• {autosaveLabel}</span>
            </div>
            <ZoomSlider value={zoom} onChange={setZoom} />
            <ZenModeToggle
              isZenMode={!showSidebar}
              onToggle={()=>{
                setShowSidebar(s=>{
                  const next = !s
                  if (next === true) {
                    // exiting focus -> expand ribbon back to previous state
                    setCollapsed(false)
                  } else {
                    // entering focus -> collapse ribbon for distraction-free
                    setCollapsed(true)
                  }
                  return next
                })
              }}
              iconOnly
            />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {showSidebar && (
          <div className="w-[280px] lg:w-[320px]">
            <SidebarPosts items={sidebarItems} onOpen={onOpenItem} onCreateNew={()=>onCommand?.('new')} />
          </div>
        )}
        <div className="flex-1 overflow-auto" style={{ transform: `scale(${zoom/100})`, transformOrigin: 'top left' }}>
          {editor}
        </div>
      </div>

      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} onRun={(id)=>onCommand?.(id)} commands={[
        { id: 'write', title: 'Write' },
        { id: 'split', title: 'Split View' },
        { id: 'preview', title: 'Preview' },
        { id: 'publish:save', title: 'Save Draft' },
        { id: 'util:ai', title: 'AI Writing Assistant' },
      ]} />
    </div>
  )
}
