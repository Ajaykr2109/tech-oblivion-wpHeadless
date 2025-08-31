"use client"
import type { Period } from '../../../types/analytics'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444']

type Summary = {
  period: string
  devices: { device_type: string; count: number }[]
  countries: { country_code: string; count: number }[]
}

export default function AnalyticsSidebar({ period, postIds: _postIds }: { period: Period, postIds: number[] }) {
  const { data } = useQuery<Summary>({
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

  const devices = data?.devices || []
  const countries = data?.countries || []
  const total = devices.reduce((a: number, b: any) => a + (b.count || 0), 0)

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Total device-sampled views</div>
        <div className="text-2xl font-semibold">{total}</div>
        <div className="h-48 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={devices} 
                dataKey="count" 
                nameKey="device_type" 
                outerRadius={70} 
                label
              >
                {devices.map((_: any, i: number) => (
                  <Cell key={`c-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4">
        <div className="text-sm font-medium mb-2">Top countries</div>
        <ul className="space-y-1 text-sm">
          {countries.slice(0, 10).map((c: any, i: number) => (
            <li key={i} className="flex justify-between">
              <span>{c.country_code}</span>
              <span>{c.count}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
