"use client"
import type { Period } from '../../../types/analytics'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'

type SummaryResp = { referers?: { source: string; count: number }[] }

export default function AnalyticsTable({ period, postIds }: { period: Period, postIds: number[] }) {
  const { data } = useQuery<SummaryResp>({
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
  const rows = data?.referers || []
  return (
    <Card className="p-4 overflow-auto">
      <h3 className="font-medium mb-2">Referers</h3>
      <table className="min-w-full text-sm">
        <thead><tr><th className="text-left">Source</th><th className="text-left">Count</th></tr></thead>
        <tbody>
          {rows.map((row: any, i: number) => (
            <tr key={i} className="border-t"><td>{row.source}</td><td>{row.count}</td></tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
