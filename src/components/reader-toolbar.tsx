"use client"
import { Moon, Sun, Plus, Minus } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ReaderToolbar() {
  const { theme, setTheme } = useTheme()
  const [scale, setScale] = useState<number>(100)
  const [top, setTop] = useState<number>(8)

  useEffect(() => {
    const s = Number(localStorage.getItem('reader:scale') || '100')
    setScale(isNaN(s) ? 100 : s)
  }, [])
  useEffect(() => {
    document.documentElement.style.setProperty('--reader-scale', String(scale))
    localStorage.setItem('reader:scale', String(scale))
  }, [scale])

  useEffect(() => {
    const updateTop = () => {
      const header = document.querySelector('header') as HTMLElement | null
      const h = header ? header.getBoundingClientRect().height : 0
      setTop(Math.max(8, h + 8))
    }
    updateTop()
    window.addEventListener('resize', updateTop)
    window.addEventListener('scroll', updateTop, { passive: true })
    return () => {
      window.removeEventListener('resize', updateTop)
      window.removeEventListener('scroll', updateTop)
    }
  }, [])

  return (
    <div style={{ top }} className="fixed right-2 z-[60] flex items-center gap-2 rounded-full bg-card/80 backdrop-blur px-2 py-1 border shadow">
      <button className="p-1 hover:text-primary" aria-label="Decrease font size" onClick={()=>setScale(Math.max(80, scale-10))}><Minus className="h-4 w-4"/></button>
      <span className="text-xs w-8 text-center">{scale}%</span>
      <button className="p-1 hover:text-primary" aria-label="Increase font size" onClick={()=>setScale(Math.min(140, scale+10))}><Plus className="h-4 w-4"/></button>
      <span className="mx-1 h-4 w-px bg-border"/>
      <button className="p-1 hover:text-primary" aria-label="Toggle theme" onClick={()=>setTheme(theme === 'dark' ? 'light' : 'dark')}>
        {theme === 'dark' ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
      </button>
    </div>
  )
}
