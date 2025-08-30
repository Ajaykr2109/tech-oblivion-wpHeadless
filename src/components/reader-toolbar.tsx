"use client"
import { Moon, Sun, Plus, Minus, RotateCcw } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

export default function ReaderToolbar() {
  const { theme, setTheme } = useTheme()
  const [scale, setScale] = useState<number>(100)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('100')
  const lastClickRef = useRef<number>(0)

  useEffect(() => {
    const s = Number(localStorage.getItem('reader:scale') || '100')
    setScale(isNaN(s) ? 100 : s)
    setDraft(String(isNaN(s) ? 100 : s))
  }, [])
  useEffect(() => {
    const s = Math.max(80, Math.min(160, scale))
    document.documentElement.style.setProperty('--reader-scale', String(s))
    localStorage.setItem('reader:scale', String(s))
  }, [scale])

  function commitDraft() {
    const n = Number(draft)
    if (!isNaN(n)) {
      setScale(Math.max(80, Math.min(160, n)))
    }
    setEditing(false)
  }

  function cancelEdit() {
    setDraft(String(scale))
    setEditing(false)
  }

  function handleLabelClick() {
    const now = Date.now()
    if (now - lastClickRef.current < 250) {
      // double click within window → reset
      setScale(100)
      setDraft('100')
      lastClickRef.current = 0
      return
    }
    lastClickRef.current = now
    // enter edit mode on single click
    setEditing(true)
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-card/70 backdrop-blur px-3 py-1.5 border shadow">
  <button className="p-1.5 hover:text-primary" aria-label="Decrease font size" onClick={()=>setScale(Math.max(80, scale-10))}><Minus className="h-4 w-4"/></button>
      {editing ? (
        <input
          className="w-14 text-xs text-center bg-transparent outline-none border-b border-border focus:border-primary rounded-none"
          value={draft}
          onChange={(e)=>setDraft(e.target.value.replace(/[^0-9]/g,''))}
          onBlur={commitDraft}
          onKeyDown={(e)=>{
            if (e.key === 'Enter') commitDraft();
            else if (e.key === 'Escape') cancelEdit();
          }}
          autoFocus
        />
      ) : (
        <span
          className="text-xs w-12 text-center tabular-nums cursor-text select-none"
          title="Click to edit, double-click to reset"
          onClick={handleLabelClick}
        >
          {scale}%
        </span>
      )}
      <button className="p-1.5 hover:text-primary" aria-label="Increase font size" onClick={()=>setScale(Math.min(160, scale+10))}><Plus className="h-4 w-4"/></button>
      <button className="p-1.5 hover:text-primary" title="Reset to 100%" aria-label="Reset zoom" onClick={()=>{ setScale(100); setDraft('100') }}>
        <RotateCcw className="h-4 w-4"/>
      </button>
      <span className="mx-1 h-4 w-px bg-border"/>
      <button
        className={`p-1.5 rounded ${theme==='light' ? 'text-primary bg-primary/10' : 'hover:text-primary'}`}
        aria-label="Light mode"
        aria-pressed={theme==='light'}
        onClick={()=>setTheme('light')}
      >
        <Sun className="h-4 w-4"/>
      </button>
      <button
        className={`p-1.5 rounded ${theme==='dark' ? 'text-primary bg-primary/10' : 'hover:text-primary'}`}
        aria-label="Dark mode"
        aria-pressed={theme==='dark'}
        onClick={()=>setTheme('dark')}
      >
        <Moon className="h-4 w-4"/>
      </button>
    </div>
  )
}
