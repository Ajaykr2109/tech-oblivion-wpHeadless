"use client"
import { useEffect, useState } from 'react'

export default function ReadingProgress({ targetSelector = '.wp-content' }: { targetSelector?: string }) {
  const [progress, setProgress] = useState(0)
  const [top, setTop] = useState<number>(0)

  useEffect(() => {
    function update() {
      const el = document.querySelector<HTMLElement>(targetSelector)
      if (!el) { setProgress(0); return }
      const rect = el.getBoundingClientRect()
      const total = el.scrollHeight - window.innerHeight
      const scrolled = window.scrollY - (el.offsetTop || 0)
      const value = total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0
      setProgress(value)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
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
      <div className="h-1 bg-primary transition-[width] duration-150 ease-out" style={{ width: `${progress}%` }} />
    </div>
  )
}
