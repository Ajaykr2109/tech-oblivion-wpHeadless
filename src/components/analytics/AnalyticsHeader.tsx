"use client"
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'

import type { Period } from '../../../types/analytics'


type Props = {
  period: Period
  onPeriodChange: (p: Period) => void
  postIds: number[]
  onPostIdsChange: (ids: number[]) => void
  chartType: 'line' | 'bar'
  onChartTypeChange: (t: 'line' | 'bar') => void
  granularity: 'daily' | 'weekly'
  onGranularityChange: (g: 'daily' | 'weekly') => void
  autoRefresh: boolean
  onAutoRefreshChange: (v: boolean) => void
}

export default function AnalyticsHeader(props: Props) {
  const { period, onPeriodChange, postIds, onPostIdsChange, chartType, onChartTypeChange, granularity, onGranularityChange, autoRefresh, onAutoRefreshChange } = props
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <div className="flex items-center gap-2">
        <Select value={period} onValueChange={(v: any) => onPeriodChange(v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Period" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="quarter">Quarter</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={chartType} onValueChange={(v: any) => onChartTypeChange(v)}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Chart" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line</SelectItem>
            <SelectItem value="bar">Bar</SelectItem>
          </SelectContent>
        </Select>
        <Select value={granularity} onValueChange={(v: any) => onGranularityChange(v)}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Granularity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <PostMultiSelect selected={postIds} onChange={onPostIdsChange} />
        <Button size="sm" variant="outline" onClick={() => {
          const u = new URL('/api/analytics/export', window.location.origin)
          u.searchParams.set('type', 'views')
          u.searchParams.set('period', period)
          if (postIds.length === 1) u.searchParams.set('postId', String(postIds[0]))
          window.location.href = u.toString()
        }}>Download CSV</Button>
      </div>
      <div className="flex items-center gap-2">
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
      </div>
      <div className="flex items-center gap-2 col-span-full">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={autoRefresh} onChange={(e) => onAutoRefreshChange(e.target.checked)} />
          Auto-refresh (60s)
        </label>
        <Button size="sm" onClick={() => window.location.reload()}>Refresh</Button>
      </div>
    </motion.div>
  )
}

type PostItem = { id: number; title: string; slug: string }

function PostMultiSelect({ selected, onChange }: { selected: number[]; onChange: (ids: number[]) => void }) {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<PostItem[]>([])

  // Debounced search to /api/wp/posts
  useEffect(() => {
    const h = setTimeout(async () => {
      setLoading(true)
      try {
        const url = new URL('/api/wp/posts', window.location.origin)
        url.searchParams.set('search', q)
        url.searchParams.set('_fields', 'id,slug,title')
        url.searchParams.set('per_page', '20')
        const res = await fetch(url.toString())
        if (res.ok) {
          const arr = await res.json()
          const mapped = Array.isArray(arr) ? arr.map((p: any) => ({ id: p.id, slug: p.slug, title: p.title?.rendered || p.title || p.slug })) : []
          setOptions(mapped)
        }
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(h)
  }, [q])

  const toggle = (id: number) => {
    const set = new Set(selected)
    if (set.has(id)) set.delete(id); else set.add(id)
    onChange(Array.from(set))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {selected.length === 0 && <Badge variant="secondary">All posts</Badge>}
        {selected.map(id => (
          <Badge key={id} variant="outline" className="cursor-pointer" onClick={() => toggle(id)}>#{id}</Badge>
        ))}
        {selected.length > 0 && (
          <Button size="sm" variant="ghost" onClick={() => onChange([])}>Clear</Button>
        )}
      </div>
      <div className="w-96 max-w-full">
        <Command>
          <CommandInput value={q} onValueChange={setQ} placeholder="Search posts…" />
          <CommandList>
            <CommandEmpty>{loading ? 'Loading…' : 'No results.'}</CommandEmpty>
            <CommandGroup heading="Results">
              {options.map(o => (
                <CommandItem key={o.id} onSelect={() => toggle(o.id)}>
                  <span className="mr-2 text-xs text-muted-foreground">#{o.id}</span>
                  {o.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
  )
}
