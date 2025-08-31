"use client"
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Period } from '../../../types/analytics'
import { Card } from '@/components/ui/card'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'

type Props = {
  period: Period
  postIds: number[]
  chartType: 'line'|'bar'
  granularity: 'daily'|'weekly'
  autoRefresh: boolean
  queryKeyBase: any[]
}

export default function AnalyticsCharts({ period, postIds, chartType, granularity, autoRefresh, queryKeyBase }: Props) {
  const refreshMs = autoRefresh ? 60000 : undefined
  const postId = postIds.length === 1 ? String(postIds[0]) : undefined
  const summaryKey = useMemo(() => ['analytics','summary', period], [period])
  const { data: summary } = useQuery({
    queryKey: summaryKey,
    queryFn: async () => {
      const u = new URL('/api/analytics/summary', window.location.origin)
      u.searchParams.set('period', period)
      const res = await fetch(u)
      if (!res.ok) throw new Error('Failed to load summary')
      return res.json()
    },
    refetchInterval: refreshMs,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  })

  const topKey = useMemo(() => ['analytics','top',period], [period])
  const { data: topPosts } = useQuery({
    queryKey: topKey,
    queryFn: async () => {
      const u = new URL('/api/analytics/top-posts', window.location.origin)
      u.searchParams.set('period', period)
      const res = await fetch(u)
      return res.json()
    },
    refetchInterval: refreshMs,
  })

  // Devices can be read from summary when needed elsewhere

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4">
        <h3 className="font-medium mb-2">Views over time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={summary?.trends?.series || []}>
                <XAxis dataKey="date" hide={false} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            ) : (
              <BarChart data={summary?.trends?.series || []}>
                <XAxis dataKey="date" hide={false} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#10b981" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-2">Top posts</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topPosts || []}>
              <XAxis dataKey="title" hide={false} interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
