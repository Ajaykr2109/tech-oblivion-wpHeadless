"use client"
import type { Period } from '../../../types/analytics'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'

export default function AnalyticsTable({ period, postIds }: { period: Period, postIds: number[] }) {
  const { data } = useQuery({
    queryKey: ['analytics','referers',period],
    queryFn: async () => {
      const u = new URL('/api/analytics/referers', window.location.origin)
      u.searchParams.set('period', period)
      const r = await fetch(u)
      return r.json()
    }
  })
  return (
    <Card className="p-4 overflow-auto">
      <h3 className="font-medium mb-2">Referers</h3>
      <table className="min-w-full text-sm">
        <thead><tr><th className="text-left">Source</th><th className="text-left">Count</th></tr></thead>
        <tbody>
          {(data || []).map((row: any, i: number) => (
            <tr key={i} className="border-t"><td>{row.source}</td><td>{row.count}</td></tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
