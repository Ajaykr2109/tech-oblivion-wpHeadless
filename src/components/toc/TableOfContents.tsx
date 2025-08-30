"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { TocItem as FlatItem } from '@/lib/toc-md'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import TOCItem from './TOCItem'
import TOCControls from './TOCControls'
import type { TocNode } from './types'
import { motion, AnimatePresence } from 'framer-motion'

function toHierarchy(items: FlatItem[]): TocNode[] {
  const root: TocNode = { id: 'root', depth: 1, value: 'root', children: [] }
  const stack: TocNode[] = [root]
  items.forEach((i) => {
    const node: TocNode = { id: i.id, depth: i.depth, value: i.value, children: [] }
    while (stack.length && (stack[stack.length - 1].depth >= node.depth)) stack.pop()
    stack[stack.length - 1].children!.push(node)
    stack.push(node)
  })
  return root.children!
}

function flatIds(items: FlatItem[]): string[] {
  return items.map(i => i.id)
}

export default function TableOfContents({ items }: { items: FlatItem[] }) {
  const [zoom, setZoom] = useState<number>(100)
  const [mode, setMode] = useState<'sticky'|'floating'>('sticky')
  const [expanded, setExpanded] = useState<boolean>(items.length <= 24)
  const [focusedIndex, setFocusedIndex] = useState<number>(0)

  useEffect(() => {
    const s = Number(localStorage.getItem('toc:zoom') || '100')
    setZoom(isNaN(s) ? 100 : s)
  }, [])
  useEffect(() => { localStorage.setItem('toc:zoom', String(zoom)) }, [zoom])

  const ids = useMemo(() => flatIds(items), [items])
  const state = useScrollSpy(ids, { rootMargin: '-40% 0px -50% 0px', nearbyRange: 1, adjacentRange: 2 })
  const hierarchy = useMemo(() => toHierarchy(items), [items])

  // Keyboard navigation
  const listRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowUp','ArrowDown','Enter'].includes(e.key)) return
      e.preventDefault()
      const idx = focusedIndex
      if (e.key === 'ArrowUp') setFocusedIndex(Math.max(0, idx - 1))
      if (e.key === 'ArrowDown') setFocusedIndex(Math.min(ids.length - 1, idx + 1))
      if (e.key === 'Enter') {
        const id = ids[focusedIndex]
        const t = document.getElementById(id)
        t?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [focusedIndex, ids])

  // Reading progress under TOC
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100
      setProgress(Math.max(0, Math.min(100, scrolled)))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const content = (
    <div className={`rounded-md border bg-card overflow-hidden`} style={{ fontSize: `${zoom}%` }}>
      <TOCControls zoom={zoom} onZoom={setZoom} mode={mode} setMode={setMode} />
      <div className="max-h-[60vh] overflow-auto focus:outline-none" ref={listRef} tabIndex={0}>
        <div className="py-2">
          {(expanded ? items : items.slice(0, 24)).map((i, idx) => {
            const st = i.id === state.activeId
              ? 'active'
              : state.nearbyIds.has(i.id) ? 'nearby'
              : state.adjacentIds.has(i.id) ? 'adjacent'
              : 'idle'
            return (
              <TOCItem
                key={i.id}
                id={i.id}
                value={i.value}
                depth={i.depth}
                state={st as any}
                focused={idx === focusedIndex}
                onClick={() => setFocusedIndex(idx)}
              />
            )
          })}
        </div>
      </div>
      <div className="h-1 bg-muted">
        <div className="h-1 bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      {items.length > 24 && (
        <button className="w-full text-xs py-1.5 hover:bg-muted border-t" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Collapse' : `Show all ${items.length}`}
        </button>
      )}
    </div>
  )

  return (
    <div className="relative">
      {/* Desktop sticky */}
      <div className="hidden lg:block lg:sticky lg:top-20">
        {content}
      </div>
      {/* Tablet collapsible */}
      <div className="hidden md:block lg:hidden">
        <details className="rounded-md border bg-card">
          <summary className="cursor-pointer px-3 py-2 font-medium">On this page</summary>
          <div className="p-3">{content}</div>
        </details>
      </div>
      {/* Mobile bottom sheet (simple) */}
      <div className="md:hidden">
        <AnimatePresence>
          <motion.details className="rounded-t-lg fixed bottom-0 left-0 right-0 z-40 bg-card border-t" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}>
            <summary className="cursor-pointer px-3 py-2 font-medium text-center">On this page</summary>
            <div className="p-3 max-h-[50vh] overflow-auto">{content}</div>
          </motion.details>
        </AnimatePresence>
      </div>
      <style jsx global>{`
        @media print { .toc-hide-print { display: none !important; } }
      `}</style>
    </div>
  )
}
