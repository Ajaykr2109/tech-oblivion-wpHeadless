"use client"
import { useEffect, useState, useRef } from 'react'

export default function ReadingProgress({ targetSelector = '.wp-content' }: { targetSelector?: string }) {
  const [progress, setProgress] = useState(0)
  const [top, setTop] = useState<number>(0)
  const rafRef = useRef<number>()
  const isScrollingRef = useRef(false)

  useEffect(() => {
    function update() {
      const el = document.querySelector<HTMLElement>(targetSelector)
      if (!el) { setProgress(0); return }
      const total = el.scrollHeight - window.innerHeight
      const scrolled = window.scrollY - (el.offsetTop || 0)
      const value = total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0
      setProgress(value)
    }

    // Optimized scroll handler with RAF for smooth animation
    function handleScroll() {
      if (!isScrollingRef.current) {
        isScrollingRef.current = true
        
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
          update()
          isScrollingRef.current = false
        })
      }
    }

    // Debounced resize handler
    let resizeTimeout: NodeJS.Timeout
    function handleResize() {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(update, 100)
    }

    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      clearTimeout(resizeTimeout)
    }
  }, [targetSelector])

  useEffect(() => {
    const computeTop = () => {
      const header = document.querySelector('header') as HTMLElement | null
      const h = header ? header.getBoundingClientRect().height : 0
      setTop(h)
    }
    computeTop()
    window.addEventListener('resize', computeTop)
    return () => window.removeEventListener('resize', computeTop)
  }, [])

  return (
    <div style={{ top }} className="fixed left-0 right-0 z-40 h-1 bg-transparent">
      <div 
        className="h-1 bg-primary transition-none" 
        style={{ 
          width: `${progress}%`,
          willChange: 'width',
          transform: 'translateZ(0)' // Force hardware acceleration
        }} 
      />
    </div>
  )
}
