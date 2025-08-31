"use client"

export type RGLItem = { i: string; x: number; y: number; w: number; h: number; static?: boolean; minW?: number; minH?: number }

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

export function useLayoutPersistence() {
  // last section helper
  const setLastSection = (s: string) => { try { localStorage.setItem('admin:lastSection', s) } catch {} }
  const getLastSection = (): string | null => { try { return localStorage.getItem('admin:lastSection') } catch { return null } }

  const loadLayout = async (section: string): Promise<RGLItem[] | null> => {
    try {
      const r = await fetch(`/api/metrics/layout?section=${encodeURIComponent(section)}`, { cache: 'no-store' })
      if (!r.ok) return null
      const j = await r.json()
      if (Array.isArray(j?.items)) return j.items as RGLItem[]
      if (Array.isArray(j)) return j as RGLItem[]
      return null
    } catch { return null }
  }

  const saveLayout = async (section: string, items: RGLItem[]) => {
    try {
      await fetch('/api/metrics/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, items }),
      })
      setLastSection(section)
    } catch {}
  }

  const deleteLayout = async (section: string) => {
    try { await fetch(`/api/metrics/layout?section=${encodeURIComponent(section)}`, { method: 'DELETE' }) } catch {}
  }

  const setDefaultLayout = async (section: string, items: RGLItem[]) => {
    try {
      await fetch('/api/metrics/layout/default', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section, items }) })
    } catch {}
  }

  return { loadLayout, saveLayout, deleteLayout, setDefaultLayout, getLastSection }
}
