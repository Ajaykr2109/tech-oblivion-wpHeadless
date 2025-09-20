"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'

import { decodeEntities } from '@/lib/entities'

export default function TOCItem({ id, value, depth, state, onClick, _minutes }: {
  id: string
  value: string
  depth: number
  state: 'active'|'nearby'|'adjacent'|'idle'
  onClick?: () => void
  _minutes?: number
}) {
  const padding = Math.max(0, (depth - 1)) * 12
  const classes = {
    active: 'bg-primary/10 font-semibold border-l-2 border-primary text-foreground',
    nearby: 'text-foreground/90',
    adjacent: 'text-muted-foreground',
    idle: 'text-muted-foreground hover:text-foreground/80'
  }[state]
  const handleClick = (e: React.MouseEvent) => {
    // Allow parent to update manualActive/focus first
    onClick?.()
    // Prevent default jump; perform header-offset smooth scroll
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const styles = getComputedStyle(document.documentElement)
    const header = parseInt(styles.getPropertyValue('--header-height') || '64', 10)
    const topOffset = (isNaN(header) ? 64 : header) + 16
    const rect = el.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const targetY = scrollTop + rect.top - topOffset
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, targetY), behavior: prefersReduced ? 'auto' : 'smooth' })
    // Update hash without causing the browser to jump again
    try {
      const url = new URL(window.location.href)
      url.hash = `#${id}`
      history.replaceState({}, '', url)
    } catch {
      // no-op: history manipulation can fail in some environments
    }
  }
  return (
    <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, ease: [0.4,0,0.2,1] }}>
      <Link href={`#${id}`} onClick={handleClick} className={`toc-link group block rounded-sm px-2 py-1.5 transition-colors ${classes}`} style={{ paddingLeft: padding + 8 }}>
        <span className={`inline-block transition-transform duration-150 ease-out group-hover:translate-x-[2px] group-hover:scale-[1.015]`}>
          {decodeEntities(value)}
        </span>
        {/* Reading time display removed from TOC as requested */}
      </Link>
    </motion.div>
  )
}
