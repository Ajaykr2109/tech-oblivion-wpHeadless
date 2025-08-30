"use client"
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BackToTop({ threshold = 400 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  if (!visible) return null

  return (
    <div className="fixed bottom-24 right-6 z-[60]">
      <Button
        size="icon"
        variant="secondary"
        className="shadow"
        aria-label="Back to top"
        onClick={() => {
          try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch { window.scrollTo(0, 0) }
        }}
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
    </div>
  )
}
