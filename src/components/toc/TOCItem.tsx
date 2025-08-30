"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'
import { decodeEntities } from '@/lib/entities'

export default function TOCItem({ id, value, depth, state, onClick, focused, minutes }: {
  id: string
  value: string
  depth: number
  focused?: boolean
  state: 'active'|'nearby'|'adjacent'|'idle'
  onClick?: () => void
  minutes?: number
}) {
  const padding = Math.max(0, (depth - 1)) * 12
  const classes = {
    active: 'bg-primary/10 font-semibold border-l-2 border-primary text-foreground',
    nearby: 'text-foreground',
    adjacent: 'text-foreground',
    idle: 'text-muted-foreground hover:text-foreground'
  }[state]
  return (
    <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: [0.4,0,0.2,1] }}>
      <Link href={`#${id}`} onClick={onClick} className={`block rounded-sm px-2 py-1.5 transition-colors ${classes}`} style={{ paddingLeft: padding + 8 }}>
  <span className={`inline-block ${focused ? 'outline outline-2 outline-primary/40 rounded-sm' : ''}`}>{decodeEntities(value)}</span>
        {typeof minutes === 'number' && minutes > 0 && (
          <span className="float-right ml-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {minutes}m
          </span>
        )}
      </Link>
    </motion.div>
  )
}
