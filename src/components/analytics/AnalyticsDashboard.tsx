"use client"
import { useMemo, useState } from 'react'
import type { Period } from '../../../types/analytics'
import AnalyticsHeader from './AnalyticsHeader'
import AnalyticsCharts from './AnalyticsCharts'
import AnalyticsTable from './AnalyticsTable'
import AnalyticsSidebar from './AnalyticsSidebar'
import SessionsChart from './SessionsChart'
import AnalyticsWorldMap from './AnalyticsWorldMap'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>('month')
  const [postIds, setPostIds] = useState<number[]>([])
  const [chartType, setChartType] = useState<'line'|'bar'>('line')
  const [granularity, setGranularity] = useState<'daily'|'weekly'>('daily')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [tab, setTab] = useState<'views'|'devices'|'countries'|'referers'|'sessions'>('views')

  const queryKeyBase = useMemo(() => [period, postIds.join(','), granularity], [period, postIds, granularity])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-9 space-y-4">
        <AnalyticsHeader
          period={period}
          onPeriodChange={setPeriod}
          postIds={postIds}
          onPostIdsChange={setPostIds}
          chartType={chartType}
          onChartTypeChange={setChartType}
          granularity={granularity}
          onGranularityChange={setGranularity}
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
        />
        <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
          <TabsList>
            <TabsTrigger value="views">Views</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="countries">Countries</TabsTrigger>
            <TabsTrigger value="referers">Referers</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>
          <TabsContent value="views">
            <AnalyticsCharts
              period={period}
              postIds={postIds}
              chartType={chartType}
              granularity={granularity}
              autoRefresh={autoRefresh}
              queryKeyBase={queryKeyBase}
            />
          </TabsContent>
          <TabsContent value="devices">
            <DevicesMain period={period} />
          </TabsContent>
          <TabsContent value="countries">
            <AnalyticsWorldMap period={period} />
          </TabsContent>
          <TabsContent value="referers">
            <AnalyticsTable period={period} postIds={postIds} />
          </TabsContent>
          <TabsContent value="sessions">
            <SessionsChart period={period} />
          </TabsContent>
        </Tabs>
      </div>
      <div className="lg:col-span-3">
        <AnalyticsSidebar period={period} postIds={postIds} />
      </div>
    </div>
  )
}

function DevicesMain({ period }: { period: Period }) {
  const { data } = useQuery({
    queryKey: ['analytics','devices',period,'main'],
    queryFn: async () => {
      const u = new URL('/api/analytics/devices', window.location.origin)
      u.searchParams.set('period', period)
      const r = await fetch(u)
      return r.json()
    }
  })
  return (
    <Card className="p-4">
      <div className="font-medium mb-2">Devices breakdown</div>
      <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </Card>
  )
}

function CountriesMain({ period }: { period: Period }) {
  const { data } = useQuery({
    queryKey: ['analytics','countries',period,'main'],
    queryFn: async () => {
      const u = new URL('/api/analytics/countries', window.location.origin)
      u.searchParams.set('period', period)
      const r = await fetch(u)
      return r.json()
    }
  })
  return (
    <Card className="p-4">
      <div className="font-medium mb-2">World map heatmap (TODO)</div>
      <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
    </Card>
  )
}
