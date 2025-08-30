"use client";
import React, { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/toc'

type Props = { items: TocItem[] }

export default function TocList({ items }: Props) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (!items?.length) return
    const ids = items.map(i => i.slug)
    const els = ids
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)

    if (!els.length) return

    const onScroll = () => {
      // Find the heading closest to top but not past 120px offset
      const offset = 120
      let current: string | null = null
      for (const el of els) {
        const rect = el.getBoundingClientRect()
        if (rect.top - offset <= 0) {
          current = el.id
        } else {
          break
        }
      }
      // Fallback to first if none selected
      setActive(current ?? els[0].id)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [items])

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const isActive = active === item.slug
        return (
          <li key={item.slug} className={`text-sm level-${item.level} ${item.level > 2 ? 'pl-4' : ''}`}>
            <a
              href={`#${item.slug}`}
              className={
                isActive
                  ? 'toc-link text-foreground font-medium underline decoration-primary/60'
                  : 'toc-link text-muted-foreground hover:text-foreground hover:underline'
              }
            >
              {item.text}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
