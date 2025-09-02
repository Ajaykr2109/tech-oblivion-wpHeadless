"use client"

export type RGLItem = { i: string; x: number; y: number; w: number; h: number; static?: boolean; minW?: number; minH?: number }

export function useLayoutPersistence() {
  // last section helper
  const setLastSection = (s: string) => { 
    try { 
      localStorage.setItem('admin:lastSection', s) 
    } catch (error) {
      console.warn('Failed to save section to localStorage:', error)
    } 
  }
  const getLastSection = (): string | null => { 
    try { 
      return localStorage.getItem('admin:lastSection') 
    } catch (error) { 
      console.warn('Failed to read section from localStorage:', error)
      return null 
    } 
  }

  const loadLayout = async (section: string): Promise<RGLItem[] | null> => {
    try {
      const r = await fetch(`/api/metrics/layout?section=${encodeURIComponent(section)}`, { cache: 'no-store' })
      if (!r.ok) return null
      const j = await r.json()
      if (Array.isArray(j?.items)) return j.items as RGLItem[]
      if (Array.isArray(j)) return j as RGLItem[]
      return null
    } catch (error) { 
      console.warn('Failed to load layout:', error)
      return null 
    }
  }

  const saveLayout = async (section: string, items: RGLItem[]) => {
    try {
      await fetch('/api/metrics/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, items }),
      })
      setLastSection(section)
    } catch (error) {
      console.warn('Failed to save layout:', error)
    }
  }

  const deleteLayout = async (section: string) => {
    try { 
      await fetch(`/api/metrics/layout?section=${encodeURIComponent(section)}`, { method: 'DELETE' }) 
    } catch (error) {
      console.warn('Failed to delete layout:', error)
    }
  }

  const setDefaultLayout = async (section: string, items: RGLItem[]) => {
    try {
      await fetch('/api/metrics/layout/default', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section, items }) })
    } catch (error) {
      console.warn('Failed to set default layout:', error)
    }
  }

  return { loadLayout, saveLayout, deleteLayout, setDefaultLayout, getLastSection }
}
