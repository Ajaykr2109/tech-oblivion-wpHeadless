"use client"
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BackToTopCenter({ threshold = 400 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  if (!visible) return null

  return (
    <button
      type="button"
      aria-label="Back to top"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[68] px-3 py-1.5 rounded-full border bg-card/90 backdrop-blur shadow text-sm inline-flex items-center gap-1 hover:bg-card"
      onClick={() => { try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch { window.scrollTo(0,0) } }}
    >
      <ArrowUp className="h-4 w-4" />
      Top
    </button>
  )
}
