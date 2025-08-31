"use client"
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import type { Period } from '../../../types/analytics'

type SummaryResp = { sessions?: { data: { date: string; sessions: number }[] } }

export default function SessionsChart({ period }: { period: Period }) {
  const { data, isLoading } = useQuery<SummaryResp>({
    queryKey: ['analytics','summary',period],
    queryFn: async () => {
      const u = new URL('/api/analytics/summary', window.location.origin)
      u.searchParams.set('period', period)
      const r = await fetch(u)
      if (!r.ok) throw new Error('Failed to load summary')
      return r.json()
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  })

  const series = data?.sessions?.data || []

  return (
    <Card className="p-4 h-[360px]">
      <div className="font-medium mb-2">Sessions over time</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={24} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      {isLoading ? <div className="text-xs text-muted-foreground">Loading…</div> : null}
    </Card>
  )
}
