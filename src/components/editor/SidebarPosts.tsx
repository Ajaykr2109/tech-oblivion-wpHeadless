'use client'

import React from 'react'
import { Search, Star, StarOff, Filter, GripVertical, FilePlus2 } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Item = {
  id: string | number
  title: string
  status: 'Published' | 'In Review' | 'Draft'
  pinned?: boolean
}

type SidebarPostsProps = {
  items?: Item[]
  onOpen?: (id: Item['id']) => void
  onCreateNew?: () => void
  onStatusChange?: (id: Item['id'], status: Item['status']) => void
  className?: string
}

export function SidebarPosts({ items = [], onOpen, onCreateNew, onStatusChange, className = '' }: SidebarPostsProps) {
  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState<'Published'|'In Review'|'Draft'|'All'>('All')
  const [list, setList] = React.useState<Item[]>(items)

  React.useEffect(() => setList(items), [items])

  // Simple reorder via drag-handle
  const dragItem = React.useRef<number | null>(null)
  const dragOverItem = React.useRef<number | null>(null)
  const onDrop = () => {
    const from = dragItem.current
    const to = dragOverItem.current
    dragItem.current = dragOverItem.current = null
    if (from == null || to == null || from === to) return
    setList(prev => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const filtered = list.filter(i =>
    (filter === 'All' || i.status === filter) &&
    (!query || i.title.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className={`h-full flex flex-col border-r bg-muted/20 ${className}`}>
      <div className="p-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search posts" className="pl-8 h-9" />
        </div>
        <Button variant="outline" size="icon" onClick={onCreateNew} aria-label="New post">
          <FilePlus2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="px-3 pb-2 flex gap-2 items-center text-xs">
        <Filter className="h-3.5 w-3.5" />
        {(['All','Published','In Review','Draft'] as const).map(s => (
          <Button key={s} size="sm" variant={filter===s?'default':'secondary'} className="h-7" onClick={()=>setFilter(s)}>{s}</Button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((i, idx) => (
          <div
            key={i.id}
            className="px-3 py-2 flex items-center gap-2 hover:bg-muted cursor-pointer border-b"
            draggable
            onDragStart={()=>{dragItem.current = idx}}
            onDragEnter={()=>{dragOverItem.current = idx}}
            onDragEnd={onDrop}
            onDragOver={e=>e.preventDefault()}
            onClick={()=>onOpen?.(i.id)}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium">{i.title}</div>
              <div className="mt-0.5"><Badge variant="secondary" className="text-[10px]">{i.status}</Badge></div>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e)=>{
                e.stopPropagation()
                const order: Item['status'][] = ['Draft','In Review','Published']
                const nextStatus = order[(order.indexOf(i.status)+1)%order.length]
                setList(prev => prev.map(x => x.id===i.id ? { ...x, status: nextStatus } : x))
                onStatusChange?.(i.id, nextStatus)
              }}
              aria-label="Cycle status"
            >
              <Badge variant="outline" className="text-[10px]">⇄</Badge>
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e)=>{e.stopPropagation();
                const next = list.map(x => x.id===i.id ? {...x, pinned: !x.pinned} : x)
                setList(next)
              }}
              aria-label={i.pinned ? 'Unpin' : 'Pin'}
            >
              {i.pinned ? <Star className="h-4 w-4 text-yellow-500" /> : <StarOff className="h-4 w-4" />}
            </Button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No posts match the filter.</div>
        )}
      </div>
    </div>
  )
}
