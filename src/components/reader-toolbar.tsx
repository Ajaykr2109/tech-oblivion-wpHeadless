"use client"
import { Moon, Sun, Plus, Minus, RotateCcw, ArrowUp, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

export default function ReaderToolbar() {
  const { theme, setTheme } = useTheme()
  const [scale, setScale] = useState<number>(100)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('100')
  const [mounted, setMounted] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [justChanged, setJustChanged] = useState(false) // For visual feedback
  const [hoveringButton, setHoveringButton] = useState<string | null>(null)
  
  const lastScrollY = useRef<number>(0)
  const lastClickTime = useRef<number>(0)
  const justChangedTimeout = useRef<NodeJS.Timeout>()

  // Haptic feedback function (where supported)
  const hapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: 10, medium: 20, heavy: 50 }
      navigator.vibrate(patterns[intensity])
    }
  }

  // Visual feedback for changes
  const triggerFeedback = () => {
    setJustChanged(true)
    hapticFeedback('light')
    if (justChangedTimeout.current) clearTimeout(justChangedTimeout.current)
    justChangedTimeout.current = setTimeout(() => setJustChanged(false), 300)
  }

  useEffect(() => {
    setMounted(true)
    const s = Number(localStorage.getItem('reader:scale') || '100')
    const v = isNaN(s) ? 100 : s
    setScale(v)
    setDraft(String(v))
  }, [])

  useEffect(() => {
    const s = Math.max(80, Math.min(140, scale))
    document.documentElement.style.setProperty('--reader-scale', String(s))
    localStorage.setItem('reader:scale', String(s))
  }, [scale])

  // Auto-collapse with enhanced smooth behavior
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      
      // Enhanced auto-hide/show behavior with smoother transitions
      // Enhanced auto-hide/show behavior with smoother transitions
      if (y < 100) {
        setIsCollapsed(false)
      } else if (!isCollapsed && y > 200 && y > lastScrollY.current + 50) {
        hapticFeedback('light')
      }
      
      lastScrollY.current = y
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduced) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [isCollapsed])

  function commitDraft() {
    const n = Number(draft)
    if (!isNaN(n)) {
      setScale(Math.max(85, Math.min(140, n)))
      triggerFeedback()
    }
    setEditing(false)
  }

  function cancelEdit() {
    setDraft(String(scale))
    setEditing(false)
  }

  function handleLabelClick() {
    const now = Date.now()
    if (lastClickTime.current && now - lastClickTime.current < 250) {
      setScale(100)
      setDraft('100')
      triggerFeedback()
      lastClickTime.current = 0
      return
    }
    lastClickTime.current = now
    setEditing(true)
    hapticFeedback('light')
  }

  function scrollToTop(e?: React.MouseEvent) {
    e?.stopPropagation()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    hapticFeedback('medium')
  }

  function onCollapsedKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsCollapsed(false)
      hapticFeedback('light')
    }
  }

  // Enhanced button click handlers with feedback
  const handleZoomIn = () => {
    setScale(Math.min(140, scale + 10))
    triggerFeedback()
  }

  const handleZoomOut = () => {
    setScale(Math.max(85, scale - 10))
    triggerFeedback()
  }

  const handleReset = () => {
    setScale(100)
    setDraft('100')
    triggerFeedback()
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    hapticFeedback('light')
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[60] flex flex-col items-center gap-2">
      <div
        className={`flex items-center gap-2 rounded-full bg-card/80 backdrop-blur border shadow-lg transition-all duration-500 ease-out ${
          isCollapsed ? 'px-2 py-1 hover:scale-105' : 'px-3 py-2'
        } ${justChanged ? 'ring-2 ring-primary/50 shadow-primary/20' : ''}`}
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        {...(isCollapsed
          ? {
              role: 'button',
              tabIndex: 0,
              onClick: () => {
                setIsCollapsed(false)
                hapticFeedback('light')
              },
              onKeyDown: onCollapsedKeyDown,
              'aria-label': 'Expand reading toolbar',
              'aria-expanded': false,
            }
          : {})}
      >
        {isCollapsed ? (
          // COLLAPSED: only the "go to top" button with enhanced hover
          <button
            className="p-2 hover:text-primary transition-all duration-300 ease-out hover:scale-110 active:scale-95"
            aria-label="Go to top"
            onClick={scrollToTop}
            onMouseEnter={() => setHoveringButton('scroll-top')}
            onMouseLeave={() => setHoveringButton(null)}
          >
            <ArrowUp className={`h-4 w-4 transition-all duration-200 ${
              hoveringButton === 'scroll-top' ? 'scale-110' : ''
            }`} />
          </button>
        ) : (
          <>
            {/* Zoom controls with enhanced interactions */}
            <button
              className="p-1.5 hover:text-primary transition-all duration-200 ease-out hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              aria-label="Decrease font size"
              onClick={handleZoomOut}
              disabled={scale <= 85}
              onMouseEnter={() => setHoveringButton('zoom-out')}
              onMouseLeave={() => setHoveringButton(null)}
            >
              <Minus className={`h-4 w-4 transition-all duration-200 ${
                hoveringButton === 'zoom-out' ? 'scale-110' : ''
              }`} />
            </button>

            {editing ? (
              <input
                className="w-14 text-xs text-center bg-transparent outline-none border-b border-border focus:border-primary rounded-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                value={draft}
                onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
                onBlur={commitDraft}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitDraft()
                  else if (e.key === 'Escape') cancelEdit()
                }}
                autoFocus
              />
            ) : (
              <span
                className="text-xs w-12 text-center tabular-nums cursor-text select-none hover:bg-primary/10 rounded px-1 py-0.5 transition-all duration-200 ease-out hover:scale-105 active:scale-95"
                title="Click to edit, double-click to reset"
                onClick={handleLabelClick}
                onMouseEnter={() => setHoveringButton('percentage')}
                onMouseLeave={() => setHoveringButton(null)}
              >
                {scale}%
              </span>
            )}

            <button
              className="p-1.5 hover:text-primary transition-all duration-200 ease-out hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              aria-label="Increase font size"
              onClick={handleZoomIn}
              disabled={scale >= 140}
              onMouseEnter={() => setHoveringButton('zoom-in')}
              onMouseLeave={() => setHoveringButton(null)}
            >
              <Plus className={`h-4 w-4 transition-all duration-200 ${
                hoveringButton === 'zoom-in' ? 'scale-110' : ''
              }`} />
            </button>

            <button
              className="p-1.5 hover:text-primary transition-all duration-200 ease-out hover:scale-110 active:scale-95"
              title="Reset to 100%"
              aria-label="Reset zoom"
              onClick={handleReset}
              onMouseEnter={() => setHoveringButton('reset')}
              onMouseLeave={() => setHoveringButton(null)}
            >
              <RotateCcw className={`h-4 w-4 transition-all duration-200 ${
                hoveringButton === 'reset' ? 'scale-110' : ''
              }`} />
            </button>

            <span className="mx-1 h-4 w-px bg-border" />

            {/* Theme controls with enhanced animations */}
            {!mounted ? (
              <>
                <button className="p-1.5 rounded transition-colors" aria-label="Light mode" disabled>
                  <Sun className="h-4 w-4" />
                </button>
                <button className="p-1.5 rounded transition-colors" aria-label="Dark mode" disabled>
                  <Moon className="h-4 w-4" />
                </button>
                <button className="p-1.5 rounded transition-colors" aria-label="System theme" disabled>
                  <Monitor className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  className={`p-1.5 rounded transition-all duration-200 ease-out hover:scale-110 active:scale-95 ${
                    theme === 'light' ? 'text-primary bg-primary/10' : 'hover:text-primary'
                  }`}
                  aria-label="Light mode"
                  aria-pressed={theme === 'light'}
                  onClick={() => handleThemeChange('light')}
                  onMouseEnter={() => setHoveringButton('theme-light')}
                  onMouseLeave={() => setHoveringButton(null)}
                >
                  <Sun className={`h-4 w-4 transition-all duration-200 ${
                    hoveringButton === 'theme-light' ? 'scale-110' : ''
                  }`} />
                </button>
                <button
                  className={`p-1.5 rounded transition-all duration-200 ease-out hover:scale-110 active:scale-95 ${
                    theme === 'dark' ? 'text-primary bg-primary/10' : 'hover:text-primary'
                  }`}
                  aria-label="Dark mode"
                  aria-pressed={theme === 'dark'}
                  onClick={() => handleThemeChange('dark')}
                  onMouseEnter={() => setHoveringButton('theme-dark')}
                  onMouseLeave={() => setHoveringButton(null)}
                >
                  <Moon className={`h-4 w-4 transition-all duration-200 ${
                    hoveringButton === 'theme-dark' ? 'scale-110' : ''
                  }`} />
                </button>
                <button
                  className={`p-1.5 rounded transition-all duration-200 ease-out hover:scale-110 active:scale-95 ${
                    theme === 'system' ? 'text-primary bg-primary/10' : 'hover:text-primary'
                  }`}
                  aria-label="System theme"
                  aria-pressed={theme === 'system'}
                  onClick={() => handleThemeChange('system')}
                  onMouseEnter={() => setHoveringButton('theme-system')}
                  onMouseLeave={() => setHoveringButton(null)}
                >
                  <Monitor className={`h-4 w-4 transition-all duration-200 ${
                    hoveringButton === 'theme-system' ? 'scale-110' : ''
                  }`} />
                </button>
              </>
            )}

            <span className="mx-1 h-4 w-px bg-border" />

            <button
              className="p-1.5 hover:text-primary transition-all duration-200 ease-out hover:scale-110 active:scale-95"
              aria-label="Go to top"
              onClick={scrollToTop}
              onMouseEnter={() => setHoveringButton('scroll-top')}
              onMouseLeave={() => setHoveringButton(null)}
            >
              <ArrowUp className={`h-4 w-4 transition-all duration-200 ${
                hoveringButton === 'scroll-top' ? 'scale-110' : ''
              }`} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
