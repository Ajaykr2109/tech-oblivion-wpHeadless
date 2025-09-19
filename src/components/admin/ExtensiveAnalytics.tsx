'use client'
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Eye, Users, Clock, TrendingUp, Download, Globe, Smartphone, Monitor, BarChart3
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

interface AnalyticsSummary {
  views: { total: number, today: number, change: string }
  visitors: { total: number, today: number, change: string }
  sessions: { total: number, avg_duration: number }
  bounce_rate: number
  top_pages: Array<{ path: string, title: string, views: number }>
  top_countries: Array<{ country: string, count: number }>
  devices: Array<{ device: string, count: number }>
}

function MetricCard({ title, value, change, icon: Icon }: {
  title: string
  value: string | number
  change?: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && <p className="text-xs text-green-600 mt-1">{change}</p>}
      </CardContent>
    </Card>
  )
}

export default function ExtensiveAnalytics() {
  const [timeRange, setTimeRange] = useState('7d')

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics-summary', timeRange],
    queryFn: async (): Promise<AnalyticsSummary> => {
      const response = await fetch(`/api/analytics/summary?period=${timeRange}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      return response.json()
    },
    staleTime: 30000
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-16" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Page Views"
          value={formatNumber(analytics?.views?.total || 0)}
          change={analytics?.views?.change}
          icon={Eye}
        />
        <MetricCard
          title="Unique Visitors"
          value={formatNumber(analytics?.visitors?.total || 0)}
          change={analytics?.visitors?.change}
          icon={Users}
        />
        <MetricCard
          title="Avg. Session"
          value={`${Math.floor((analytics?.sessions?.avg_duration || 0) / 60)}m`}
          icon={Clock}
        />
        <MetricCard
          title="Bounce Rate"
          value={`${analytics?.bounce_rate || 0}%`}
          icon={TrendingUp}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analytics?.top_countries?.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{item.country}</span>
                    <Badge variant="secondary">{formatNumber(item.count)}</Badge>
                  </div>
                )) || <p className="text-sm text-muted-foreground">No data available</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Device Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analytics?.devices?.slice(0, 5).map((item, index) => {
                  const DeviceIcon = item.device === 'mobile' ? Smartphone : Monitor
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm">
                        <DeviceIcon className="h-4 w-4" />
                        {item.device}
                      </span>
                      <Badge variant="secondary">{formatNumber(item.count)}</Badge>
                    </div>
                  )
                }) || <p className="text-sm text-muted-foreground">No data available</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Top Pages
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analytics?.top_pages?.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title || item.path}</p>
                    </div>
                    <Badge variant="secondary">{formatNumber(item.views)}</Badge>
                  </div>
                )) || <p className="text-sm text-muted-foreground">No data available</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.top_pages?.slice(0, 10).map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{page.title || page.path}</p>
                      <p className="text-xs text-muted-foreground truncate">{page.path}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatNumber(page.views)} views</p>
                      <p className="text-xs text-muted-foreground">#{index + 1}</p>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No content data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.top_countries?.slice(0, 8).map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{country.country}</span>
                      <Badge variant="secondary">{formatNumber(country.count)}</Badge>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground">No geographic data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.devices?.slice(0, 6).map((device, index) => {
                    const DeviceIcon = device.device === 'mobile' ? Smartphone : Monitor
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm">
                          <DeviceIcon className="h-4 w-4" />
                          {device.device}
                        </span>
                        <Badge variant="secondary">{formatNumber(device.count)}</Badge>
                      </div>
                    )
                  }) || (
                    <p className="text-sm text-muted-foreground">No device data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}