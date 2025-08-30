"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function TOCItem({ id, value, depth, state, onClick, focused }: {
  id: string
  value: string
  depth: number
  focused?: boolean
  state: 'active'|'nearby'|'adjacent'|'idle'
  onClick?: () => void
}) {
  const padding = Math.max(0, (depth - 1)) * 12
  const classes = {
    active: 'bg-gradient-to-r from-blue-500/25 via-blue-500/15 to-transparent font-semibold border-l-2 border-blue-500 text-foreground',
    nearby: 'bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent text-foreground/95',
    adjacent: 'bg-gradient-to-r from-foreground/10 via-foreground/5 to-transparent text-foreground/90',
    idle: 'text-muted-foreground hover:text-foreground'
  }[state]
  return (
    <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: [0.4,0,0.2,1] }}>
      <Link href={`#${id}`} onClick={onClick} className={`block rounded-sm px-2 py-1.5 transition-colors ${classes}`} style={{ paddingLeft: padding + 8 }}>
        <span className={`inline-block ${focused ? 'outline outline-2 outline-primary/40 rounded-sm' : ''}`}>{value}</span>
      </Link>
    </motion.div>
  )
}
