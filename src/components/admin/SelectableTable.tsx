"use client"

import { useMemo, useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'

export type Row = { id: number; cells: React.ReactNode[] }

type Props = {
  rows: Row[]
  header: React.ReactNode[]
  onSelectionChange?: (ids: number[]) => void
}

export default function SelectableTable({ rows, header, onSelectionChange }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set())

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

  return (
    <Table>
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
        {rows.map(r=> (
          <TableRow key={r.id}>
            <TableCell className="w-[40px]"><Checkbox checked={selected.has(r.id)} onCheckedChange={(v)=>toggleOne(r.id, !!v)} /></TableCell>
            {r.cells.map((c,i)=>(<TableCell key={i}>{c}</TableCell>))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
