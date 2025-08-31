"use client"
import type { Period } from '../../../types/analytics'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

const COLORS = ['#0ea5e9','#22c55e','#f97316','#a78bfa','#f43f5e']

export default function AnalyticsSidebar({ period, postIds }: { period: Period, postIds: number[] }) {
  const { data: devices } = useQuery({
    queryKey: ['analytics','devices',period,'sidebar'],
    queryFn: async () => {
      const u = new URL('/api/analytics/devices', window.location.origin)
      u.searchParams.set('period', period)
      const r = await fetch(u)
      return r.json()
    }
  })
  const { data: countries } = useQuery({
    queryKey: ['analytics','countries',period,'sidebar'],
    queryFn: async () => {
      const u = new URL('/api/analytics/countries', window.location.origin)
      u.searchParams.set('period', period)
      const r = await fetch(u)
      return r.json()
    }
  })
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="font-medium mb-2">Devices</div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={devices || []} dataKey="count" nameKey="device_type" cx="50%" cy="50%" outerRadius={70} label>
                {(devices || []).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <div className="font-medium mb-2">Top Countries</div>
        <ul className="text-sm space-y-1 max-h-64 overflow-auto">
          {(countries || []).slice(0, 10).map((c: any, i: number) => (
            <li key={i} className="flex justify-between"><span>{c.country_code}</span><span>{c.count}</span></li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
"use client"
import type { Period } from '../../../types/analytics'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444']

export default function AnalyticsSidebar({ period, postIds }: { period: Period, postIds: number[] }) {
  const { data: devices } = useQuery({
    queryKey: ['analytics','devices',period],
    queryFn: async () => {
      const u = new URL('/api/analytics/devices', window.location.origin)
      u.searchParams.set('period', period)
      const r = await fetch(u)
      return r.json()
    }
  })
  const { data: countries } = useQuery({
    queryKey: ['analytics','countries',period],
    queryFn: async () => {
      const u = new URL('/api/analytics/countries', window.location.origin)
      u.searchParams.set('period', period)
      const r = await fetch(u)
      return r.json()
    }
  })
  const total = (devices || []).reduce((a: number, b: any) => a + (b.count || 0), 0)
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">Total device-sampled views</div>
        <div className="text-2xl font-semibold">{total}</div>
        <div className="h-48 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={devices || []} dataKey="count" nameKey="device_type" outerRadius={70} label>
                {(devices || []).map((_: any, i: number) => (
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
          {(countries || []).slice(0, 10).map((c: any, i: number) => (
            <li key={i} className="flex justify-between"><span>{c.country_code}</span><span>{c.count}</span></li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
