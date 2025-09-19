"use client"

import { useMemo, useState } from 'react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'

export type Row = { id: number; cells: React.ReactNode[] }

type Props = {
  rows: Row[]
  header: React.ReactNode[]
  onSelectionChange?: (ids: number[]) => void
  maxHeight?: string | number
  showKeyboardHints?: boolean
  rowStates?: Record<number, 'normal' | 'trash'>
  onRowActivate?: (id: number) => void
}

export default function SelectableTable({ rows, header, onSelectionChange, maxHeight, showKeyboardHints = true, rowStates, onRowActivate }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [focused, setFocused] = useState(false)

  const allIds = useMemo(() => rows.map(r => r.id), [rows])
  const allChecked = selected.size > 0 && selected.size === rows.length
  const indeterminate = selected.size > 0 && selected.size < rows.length

  const toggleAll = (checked: boolean) => {
    const next = new Set<number>()
    if (checked) allIds.forEach(id => next.add(id))
    setSelected(next)
    onSelectionChange?.(Array.from(next))
  }
  const toggleOne = (id: number, checked: boolean) => {
    const next = new Set(selected)
    if (checked) next.add(id)
    else next.delete(id)
    setSelected(next)
    onSelectionChange?.(Array.from(next))
  }

  const containerStyle = typeof maxHeight !== 'undefined' ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight, overflowY: 'auto' as const } : undefined

  return (
    <div
      className={cn('relative', containerStyle ? 'rounded-md border' : undefined)}
      style={containerStyle}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false)
      }}
    >
    <Table role="table" aria-label="Items table">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]">
            <Checkbox checked={allChecked} onCheckedChange={(v)=>toggleAll(!!v)}
              {...(indeterminate ? { 'data-state': 'indeterminate' } : {})} />
          </TableHead>
          {header.map((h,i)=>(<TableHead key={i}>{h}</TableHead>))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(r=> {
          const isTrash = rowStates?.[r.id] === 'trash'
          return (
            <TableRow
              key={r.id}
              tabIndex={0}
              className={cn('outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2', isTrash && 'opacity-60')}
              aria-label={`Row ${r.id}`}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.code === 'Space') {
                  e.preventDefault()
                  toggleOne(r.id, !selected.has(r.id))
                } else if (e.key === 'Enter') {
                  onRowActivate?.(r.id)
                }
              }}
            >
              <TableCell className="w-[40px]"><Checkbox aria-label={`Select row ${r.id}`} checked={selected.has(r.id)} onCheckedChange={(v)=>toggleOne(r.id, !!v)} /></TableCell>
              {r.cells.map((c,i)=>(<TableCell key={i}>{c}</TableCell>))}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
    {showKeyboardHints && (
      <div className={cn('pointer-events-none sticky bottom-0 w-full text-[11px] text-muted-foreground bg-background/80 backdrop-blur px-3 py-1 border-t', focused ? 'opacity-100' : 'opacity-0 md:opacity-50')}
           aria-hidden={!focused}
      >
        Keyboard: Enter  open, Space  select
      </div>
    )}
    </div>
  )
}
