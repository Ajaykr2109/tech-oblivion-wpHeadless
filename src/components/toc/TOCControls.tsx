"use client"
import { Minus, Plus, Sun, Moon, Monitor, Dock } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function TOCControls({ onZoom, zoom, mode, setMode }: { zoom: number; onZoom: (z:number)=>void; mode: 'sticky'|'floating'; setMode: (m:'sticky'|'floating')=>void }) {
  const { theme, setTheme, systemTheme } = useTheme()
  const [localZoom, setLocalZoom] = useState(zoom)
  useEffect(()=>setLocalZoom(zoom),[zoom])
  return (
    <div className="sticky top-0 z-10 bg-card/80 backdrop-blur px-3 py-2 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <button className="p-1 hover:text-primary" aria-label="Zoom out" onClick={()=>onZoom(Math.max(50, localZoom-10))}><Minus className="h-4 w-4"/></button>
        <span className="text-xs tabular-nums w-12 text-center">{localZoom}%</span>
        <button className="p-1 hover:text-primary" aria-label="Zoom in" onClick={()=>onZoom(Math.min(200, localZoom+10))}><Plus className="h-4 w-4"/></button>
        <button className="text-xs ml-1 px-2 py-0.5 rounded border hover:bg-muted" onClick={()=>onZoom(100)}>Reset</button>
      </div>
  <div className="flex items-center gap-2">
        <button className="p-1 hover:text-primary" aria-label="Light" onClick={()=>setTheme('light')}><Sun className="h-4 w-4"/></button>
        <button className="p-1 hover:text-primary" aria-label="Dark" onClick={()=>setTheme('dark')}><Moon className="h-4 w-4"/></button>
        <button className="p-1 hover:text-primary" aria-label="System" onClick={()=>setTheme('system')}><Monitor className="h-4 w-4"/></button>
        <button className="p-1 hover:text-primary" aria-label="Toggle layout" onClick={()=>setMode(mode==='sticky'?'floating':'sticky')}><Dock className="h-4 w-4"/></button>
      </div>
    </div>
  )
}
