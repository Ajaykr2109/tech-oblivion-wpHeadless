"use client"
import { Moon, Sun, Plus, Minus, RotateCcw, ArrowUp, ChevronUp, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

export default function ReaderToolbar() {
  const { theme, setTheme } = useTheme()
  const [scale, setScale] = useState<number>(100)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('100')
  const [mounted, setMounted] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const lastClickRef = useRef<number>(0)
  const lastScrollY = useRef<number>(0)

  useEffect(() => {
    setMounted(true)
    const s = Number(localStorage.getItem('reader:scale') || '100')
    setScale(isNaN(s) ? 100 : s)
    setDraft(String(isNaN(s) ? 100 : s))
  }, [])

  useEffect(() => {
    const s = Math.max(85, Math.min(140, scale))
    // Apply scale to both content and title using CSS custom property
    document.documentElement.style.setProperty('--content-scale', String(s / 100))
    localStorage.setItem('reader:scale', String(s))
  }, [scale])

  // Handle scroll behavior for auto-collapse
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Auto-collapse on scroll down, expand on scroll up or near top
      if (currentScrollY > 200) {
        if (currentScrollY > lastScrollY.current + 50) {
          setIsCollapsed(true)
        } else if (currentScrollY < lastScrollY.current - 30) {
          setIsCollapsed(false)
        }
      } else {
        setIsCollapsed(false)
      }
      
      lastScrollY.current = currentScrollY
    }

    // Respect user's reduced motion preference
    const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!hasReducedMotion) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  function commitDraft() {
    const n = Number(draft)
    if (!isNaN(n)) {
      setScale(Math.max(85, Math.min(140, n)))
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

  function scrollToTop() {
    const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ 
      top: 0, 
      behavior: hasReducedMotion ? 'auto' : 'smooth' 
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-2">
      {/* Main toolbar */}
      <div 
        className={`flex items-center gap-2 rounded-full bg-card/80 backdrop-blur border shadow-lg transition-all duration-300 ${
          isCollapsed 
            ? 'px-2 py-1' 
            : 'px-3 py-2'
        }`}
        style={{
          // Ensure toolbar doesn't overlap with content on mobile
          marginBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* Collapsed state: just Go To Top + expand button */}
        {isCollapsed ? (
          <>
            <button 
              className="p-2 hover:text-primary transition-colors"
              aria-label="Go to top"
              onClick={scrollToTop}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              className="p-1 hover:text-primary transition-colors"
              aria-label="Expand toolbar"
              onClick={() => setIsCollapsed(false)}
            >
              <ChevronUp className="h-3 w-3" />
            </button>
          </>
        ) : (
          <>
            {/* Zoom controls */}
            <button 
              className="p-1.5 hover:text-primary transition-colors" 
              aria-label="Decrease font size" 
              onClick={() => setScale(Math.max(85, scale - 10))}
            >
              <Minus className="h-4 w-4" />
            </button>
            
            {editing ? (
              <input
                className="w-14 text-xs text-center bg-transparent outline-none border-b border-border focus:border-primary rounded-none"
                value={draft}
                onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
                onBlur={commitDraft}
                onKeyDown={(e) => {
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
            
            <button 
              className="p-1.5 hover:text-primary transition-colors" 
              aria-label="Increase font size" 
              onClick={() => setScale(Math.min(140, scale + 10))}
            >
              <Plus className="h-4 w-4" />
            </button>
            
            <button 
              className="p-1.5 hover:text-primary transition-colors" 
              title="Reset to 100%" 
              aria-label="Reset zoom" 
              onClick={() => { setScale(100); setDraft('100') }}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            
            <span className="mx-1 h-4 w-px bg-border" />
            
            {/* Theme controls - render only after hydration */}
            {!mounted ? (
              // Fallback buttons with neutral styling during SSR
              <>
                <button
                  className="p-1.5 rounded hover:text-primary transition-colors"
                  aria-label="Light mode"
                  disabled
                >
                  <Sun className="h-4 w-4" />
                </button>
                <button
                  className="p-1.5 rounded hover:text-primary transition-colors"
                  aria-label="Dark mode"
                  disabled
                >
                  <Moon className="h-4 w-4" />
                </button>
                <button
                  className="p-1.5 rounded hover:text-primary transition-colors"
                  aria-label="System theme"
                  disabled
                >
                  <Monitor className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  className={`p-1.5 rounded transition-colors ${
                    theme === 'light' ? 'text-primary bg-primary/10' : 'hover:text-primary'
                  }`}
                  aria-label="Light mode"
                  aria-pressed={theme === 'light'}
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-4 w-4" />
                </button>
                <button
                  className={`p-1.5 rounded transition-colors ${
                    theme === 'dark' ? 'text-primary bg-primary/10' : 'hover:text-primary'
                  }`}
                  aria-label="Dark mode"
                  aria-pressed={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-4 w-4" />
                </button>
                <button
                  className={`p-1.5 rounded transition-colors ${
                    theme === 'system' ? 'text-primary bg-primary/10' : 'hover:text-primary'
                  }`}
                  aria-label="System theme"
                  aria-pressed={theme === 'system'}
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="h-4 w-4" />
                </button>
              </>
            )}
            
            <span className="mx-1 h-4 w-px bg-border" />
            
            {/* Go to top button */}
            <button 
              className="p-1.5 hover:text-primary transition-colors" 
              aria-label="Go to top"
              onClick={scrollToTop}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
