"use client"
import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function TOCControls() {
  const { theme, setTheme, systemTheme } = useTheme()
  const effectiveTheme = (theme === 'system' ? systemTheme : theme) || 'light'
  return (
    <div className="sticky top-0 z-10 px-2 py-1 flex items-center gap-2">
      <button
        className={`p-1 rounded ${effectiveTheme==='light' ? 'text-primary bg-primary/10' : 'hover:text-primary'}`}
        aria-label="Light"
        aria-pressed={effectiveTheme==='light'}
        onClick={()=>setTheme('light')}
      >
        <Sun className="h-4 w-4"/>
      </button>
      <button
        className={`p-1 rounded ${effectiveTheme==='dark' ? 'text-primary bg-primary/10' : 'hover:text-primary'}`}
        aria-label="Dark"
        aria-pressed={effectiveTheme==='dark'}
        onClick={()=>setTheme('dark')}
      >
        <Moon className="h-4 w-4"/>
      </button>
    </div>
  )
}
