"use client"
import { useEffect, useMemo, useState } from 'react'

export type ActiveState = {
  activeId: string | null
  nearbyIds: Set<string>
  adjacentIds: Set<string>
}

export function useScrollSpy(
  ids: string[],
  options?: { rootMargin?: string; nearbyRange?: number; adjacentRange?: number }
) {
  const [state, setState] = useState<ActiveState>({ activeId: null, nearbyIds: new Set(), adjacentIds: new Set() })
  const nearbyRange = options?.nearbyRange ?? 1
  const adjacentRange = options?.adjacentRange ?? 2

  const idIndex = useMemo(() => {
    const map = new Map<string, number>()
    ids.forEach((id, i) => map.set(id, i))
    return map
  }, [ids])

  // Derive an offset from CSS variable --header-height with a small cushion.
  function getTopOffset(): number {
    try {
      const styles = getComputedStyle(document.documentElement)
      const header = parseInt(styles.getPropertyValue('--header-height') || '64', 10)
      return (isNaN(header) ? 64 : header) + 24
    } catch {
      return 88
    }
  }

  useEffect(() => {
    if (!ids.length) return
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]
    if (!elements.length) return

    let raf = 0
    let lastActive: string | null = null

    const compute = () => {
      raf = 0
      const offset = getTopOffset()
      let current: string | null = null
      
      // Check if we're at the bottom of the page
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10
      
      for (const el of elements) {
        const top = el.getBoundingClientRect().top
        if (top - offset <= 0) current = el.id
        else break
      }
      
      // Fallbacks: top of page => first; bottom past last => last
      if (!current) current = elements[0].id
      else if (isAtBottom) current = elements[elements.length - 1].id
      
      const idx = idIndex.get(current) ?? 0
      const nearby = new Set<string>()
      const adjacent = new Set<string>()
      for (let i = Math.max(0, idx - nearbyRange); i <= Math.min(ids.length - 1, idx + nearbyRange); i++) {
        if (i !== idx) nearby.add(ids[i])
      }
      for (let i = Math.max(0, idx - adjacentRange); i <= Math.min(ids.length - 1, idx + adjacentRange); i++) {
        if (!nearby.has(ids[i]) && i !== idx) adjacent.add(ids[i])
      }
      if (current !== lastActive) {
        lastActive = current
        setState({ activeId: current, nearbyIds: nearby, adjacentIds: adjacent })
        // Update URL hash (without page jump)
        try {
          const url = new URL(window.location.href)
          url.hash = `#${current}`
          history.replaceState({}, '', url)
        } catch {
          // Silently handle URL manipulation errors
        }
      } else {
        // Still update nearby/adjacent to keep badges consistent
        setState((s) => ({ activeId: s.activeId, nearbyIds: nearby, adjacentIds: adjacent }))
      }
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(compute)
    }
    const onResize = () => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(compute)
    }

    // Initial run after paint to avoid layout thrash
    raf = requestAnimationFrame(compute)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [ids, idIndex, nearbyRange, adjacentRange])

  return state
}
