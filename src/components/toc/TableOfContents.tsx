"use client"
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronUp } from 'lucide-react'

import { TocItem as FlatItem } from '@/lib/toc-md'
import { useScrollSpy } from '@/hooks/useScrollSpy'

import TOCItem from './TOCItem'
import type { TocNode, SectionTimeMap } from './types'

type ItemState = 'active' | 'nearby' | 'adjacent' | 'idle'

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
  // Client-side fallback: if no items provided, try to derive from DOM
  const [derivedItems, setDerivedItems] = useState<FlatItem[] | null>(null)
  useEffect(() => {
    if (items && items.length > 0) { setDerivedItems(null); return }
    // derive from document headings h2/h3
    const nodes = Array.from(document.querySelectorAll('.wp-content h2[id], .wp-content h3[id]')) as HTMLElement[]
    if (!nodes.length) return
    const arr: FlatItem[] = nodes.map((el) => ({ id: el.id, depth: el.tagName === 'H2' ? 2 : 3, value: el.textContent || '' }))
    setDerivedItems(arr)
  }, [items])
  const _items = (derivedItems && derivedItems.length > 0) ? derivedItems : items
  const [zoom, setZoom] = useState<number>(100)
  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const [_open, _setOpen] = useState<boolean>(false) // floating disabled
  const [mobileOpen, setMobileOpen] = useState<boolean>(false) // Mobile TOC state
  const [tabletOpen, setTabletOpen] = useState<boolean>(false) // Tablet TOC state

  useEffect(() => {
    const fromReader = Number(localStorage.getItem('reader:scale') || '100')
    const s = Number(localStorage.getItem('toc:zoom') || String(fromReader || '100'))
    setZoom(isNaN(s) ? 100 : s)
  }, [])
  useEffect(() => {
    localStorage.setItem('toc:zoom', String(zoom))
    // Drive global reader scale (affects .wp-content font-size)
    document.documentElement.style.setProperty('--reader-scale', String(zoom))
    localStorage.setItem('reader:scale', String(zoom))
  }, [zoom])
  // Floating mode removed on post page

  const ids = useMemo(() => flatIds(_items), [_items])
  // Compute rootMargin to account for sticky header height
  const rootMargin = useMemo(() => {
    if (typeof window === 'undefined') return '-25% 0px -60% 0px'
    const styles = getComputedStyle(document.documentElement)
    const header = parseInt(styles.getPropertyValue('--header-height') || '64', 10)
    const topOffset = (isNaN(header) ? 64 : header) + 24 // add small cushion
    return `-${topOffset}px 0px -60% 0px`
  }, [])
  // Keep nearby range small so only the truly in-view section remains highlighted
  const state = useScrollSpy(ids, { rootMargin, nearbyRange: 0, adjacentRange: 1 })
  // Manual active override when user clicks a TOC item; clears once heading is in view
  const [manualActive, setManualActive] = useState<string | null>(null)
  useEffect(() => {
    if (!manualActive) return
    const el = document.getElementById(manualActive)
    if (!el) return
    const off = () => {
      const rect = el.getBoundingClientRect()
      const styles = getComputedStyle(document.documentElement)
      const header = parseInt(styles.getPropertyValue('--header-height') || '64', 10)
      const topOffset = (isNaN(header) ? 64 : header) + 24
      if (rect.top <= topOffset + 4) setManualActive(null)
    }
    const t = setInterval(off, 100)
    return () => clearInterval(t)
  }, [manualActive])
  const _hierarchy = useMemo(() => toHierarchy(_items), [_items])
  // Sync a class on the active heading in the document to avoid flicker
  // Sync content heading highlight strictly to the single activeId
  useEffect(() => {
    if (!ids.length) return
    const clearAll = () => ids.forEach(id => document.getElementById(id)?.classList.remove('heading-active'))
    clearAll()
    if (state.activeId) {
      document.getElementById(state.activeId)?.classList.add('heading-active')
    }
  }, [state.activeId, ids])
  // Floating mode removed

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
        if (t) {
          const styles = getComputedStyle(document.documentElement)
          const header = parseInt(styles.getPropertyValue('--header-height') || '64', 10)
          const topOffset = (isNaN(header) ? 64 : header) + 16
          const rect = t.getBoundingClientRect()
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop
          const targetY = scrollTop + rect.top - topOffset
          const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
          window.scrollTo({ top: Math.max(0, targetY), behavior: prefersReduced ? 'auto' : 'smooth' })
          try {
            const url = new URL(window.location.href)
            url.hash = `#${id}`
            history.replaceState({}, '', url)
          } catch {
            // no-op
          }
        }
      }
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [focusedIndex, ids])

  // Compute per-section reading time badges by measuring text between headings
  const [sectionTimes, setSectionTimes] = useState<SectionTimeMap>({})
  useEffect(() => {
    if (!_items.length) return
    const compute = () => {
      const idsOnPage = _items.map(i => i.id).filter(id => document.getElementById(id))
      if (!idsOnPage.length) { setSectionTimes({}); return }
      const speedWpm = 200
      const getSectionRange = (startId: string, endId?: string) => {
        const startEl = document.getElementById(startId)
        const endEl = endId ? document.getElementById(endId) : null
        if (!startEl) return ''
        let text = ''
        let node: Node | null = startEl.nextSibling
        while (node) {
          if (endEl && node === endEl) break
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement
            if (/^H[1-6]$/.test(el.tagName)) break
            text += ' ' + el.innerText
          } else if (node.nodeType === Node.TEXT_NODE) {
            text += ' ' + (node.textContent || '')
          }
          node = node.nextSibling
        }
        return text
      }
      const map: SectionTimeMap = {}
      for (let i = 0; i < idsOnPage.length; i++) {
        const start = idsOnPage[i]
        const end = idsOnPage[i+1]
        const text = getSectionRange(start, end)
        const words = text.trim().split(/\s+/).filter(Boolean).length
        const minutes = Math.max(0, Math.round(words / speedWpm))
        map[start] = minutes
      }
      setSectionTimes(map)
    }
    // compute after paint
    const id = requestAnimationFrame(() => setTimeout(compute, 0))
    return () => cancelAnimationFrame(id)
  }, [_items])

  const content = (
    <div className={`overflow-hidden print:hidden`}>
      <div className="toc-scroll max-h-[60vh] overflow-auto focus:outline-none" ref={listRef} tabIndex={0}>
        <div className="py-2">
          {_items.map((i, idx) => {
            const activeId = manualActive ?? state.activeId
            const st = i.id === activeId
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
                state={st as ItemState}
                onClick={() => { setFocusedIndex(idx); setManualActive(i.id) }}
                _minutes={sectionTimes[i.id]}
              />
            )
          })}
        </div>
      </div>
    </div>
  )

  // Keep active TOC item in view when list overflows
  useEffect(() => {
    const targetId = manualActive ?? state.activeId
    if (!targetId) return
    const container = listRef.current
    if (!container) return
    const el = container.querySelector(`a[href="#${CSS.escape(targetId)}"]`) as HTMLElement | null
    if (!el) return
    
    // Check if element is visible in container
    const cRect = container.getBoundingClientRect()
    const eRect = el.getBoundingClientRect()
    const isAbove = eRect.top < cRect.top + 8
    const isBelow = eRect.bottom > cRect.bottom - 8
    
    if (isAbove || isBelow) {
      // Respect user's motion preferences
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ 
        block: 'nearest', 
        inline: 'nearest',
        behavior: hasReducedMotion ? 'auto' : 'smooth' 
      })
    }
  }, [state.activeId, manualActive])

  return (
    <div className="relative">
  {/* Floating opener removed */}

      {/* Desktop sticky (only when sticky mode) */}
      <div className="hidden lg:block lg:sticky lg:top-20 print:hidden">
        {content}
      </div>

      {/* Tablet collapsible (sticky mode) */}
      <div className="hidden md:block lg:hidden print:hidden">
        <div className="bg-card border rounded-lg">
          <button 
            className="w-full cursor-pointer px-3 py-2 font-medium text-left hover:bg-muted/50 flex items-center justify-between"
            onClick={() => setTabletOpen(!tabletOpen)}
          >
            <span>On this page</span>
            <ChevronUp className={`h-4 w-4 transition-transform ${tabletOpen ? 'rotate-180' : ''}`} />
          </button>
          {tabletOpen && (
            <div className="p-3 border-t">{content}</div>
          )}
        </div>
      </div>

      {/* Floating side flyout for md+ when mode=floating */}

      {/* Mobile bottom sheet (always available) */}
      <div className="md:hidden print:hidden">
        <div 
          className="rounded-t-lg fixed bottom-0 left-0 right-0 z-40 bg-card border-t" 
        >
          <button 
            className="w-full cursor-pointer px-3 py-2 font-medium text-center hover:bg-muted/50 flex items-center justify-center gap-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span>On this page</span>
            <ChevronUp className={`h-4 w-4 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} />
          </button>
          {mobileOpen && (
            <div className="p-3 max-h-[50vh] overflow-auto border-t">{content}</div>
          )}
        </div>
      </div>
    </div>
  )
}
