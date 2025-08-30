"use client"
import { useEffect, useMemo, useState } from 'react'

export type ActiveState = {
  activeId: string | null
  nearbyIds: Set<string>
  adjacentIds: Set<string>
}

export function useScrollSpy(ids: string[], options?: { rootMargin?: string; nearbyRange?: number; adjacentRange?: number }) {
  const [state, setState] = useState<ActiveState>({ activeId: null, nearbyIds: new Set(), adjacentIds: new Set() })
  const rootMargin = options?.rootMargin ?? '-40% 0px -50% 0px'
  const nearbyRange = options?.nearbyRange ?? 1
  const adjacentRange = options?.adjacentRange ?? 2

  const idIndex = useMemo(() => {
    const map = new Map<string, number>()
    ids.forEach((id, i) => map.set(id, i))
    return map
  }, [ids])

  useEffect(() => {
    if (!ids.length) return
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]
    if (!elements.length) return

    let active: string | null = null
    const io = new IntersectionObserver((entries) => {
      // Pick the most prominent intersecting entry (closest to top)
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))
      const nextActive = visible[0]?.target?.id || null
      if (nextActive !== active) {
        active = nextActive
        const idx = nextActive ? idIndex.get(nextActive) ?? -1 : -1
        const nearby = new Set<string>()
        const adjacent = new Set<string>()
        if (idx >= 0) {
          for (let i = Math.max(0, idx - nearbyRange); i <= Math.min(ids.length - 1, idx + nearbyRange); i++) {
            if (i !== idx) nearby.add(ids[i])
          }
          for (let i = Math.max(0, idx - adjacentRange); i <= Math.min(ids.length - 1, idx + adjacentRange); i++) {
            if (!nearby.has(ids[i]) && i !== idx) adjacent.add(ids[i])
          }
        }
        setState({ activeId: nextActive, nearbyIds: nearby, adjacentIds: adjacent })
        // Update URL hash (without page jump)
        if (nextActive) {
          const url = new URL(window.location.href)
          url.hash = `#${nextActive}`
          history.replaceState({}, '', url)
        }
      }
    }, { rootMargin, threshold: [0, 1] })

    elements.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids, idIndex, rootMargin, nearbyRange, adjacentRange])

  return state
}
