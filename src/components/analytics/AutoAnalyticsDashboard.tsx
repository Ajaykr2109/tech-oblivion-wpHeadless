"use client"
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, Eye, Globe, Smartphone, Monitor, Tablet, TrendingUp, Clock, BarChart3 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DashboardData {
  overview: {
    totalViews: number
    uniqueVisitors: number
    pageViews: number
    avgSessionDuration: number
    bounceRate: number
    topCountries: Array<{ country: string; count: number }>
    topDevices: Array<{ device: string; count: number }>
    topPages: Array<{ path: string; title: string; views: number }>
  }
  timeline: Array<{
    date: string
    views: number
    visitors: number
    sessions: number
  }>
  realtime: {
    activeUsers: number
    currentPage: string
    recentActions: Array<{
      type: string
      path: string
      timestamp: string
      country?: string
      device?: string
    }>
  }
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
}

function MetricCard({ title, value, change, icon: Icon, trend = 'neutral' }: MetricCardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${trendColor}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function TopItemsList<T>({ 
  title, 
  items, 
  renderItem 
}: { 
  title: string
  items: T[]
  renderItem: (item: T) => React.ReactNode 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            {renderItem(item)}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function AutoAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d')
  const [refreshInterval] = useState(30000) // 30 seconds

  // Fetch dashboard data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-analytics', timeRange],
    queryFn: async (): Promise<DashboardData> => {
      const response = await fetch(`/api/analytics/dashboard?range=${timeRange}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      return response.json()
    },
    refetchInterval: refreshInterval,
    staleTime: 30000, // 30 seconds
  })

  // Auto-refresh controls
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval, refetch])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">Analytics Unavailable</h3>
            <p className="text-sm">
              {error instanceof Error ? error.message : 'Failed to load analytics data'}
            </p>
            <Button onClick={() => refetch()} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${remainingSeconds}s`
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">
            Auto-refresh {refreshInterval / 1000}s
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Views"
          value={formatNumber(data.overview.totalViews)}
          change="+12% from last period"
          icon={Eye}
          trend="up"
        />
        <MetricCard
          title="Unique Visitors"
          value={formatNumber(data.overview.uniqueVisitors)}
          change="+8% from last period"
          icon={Users}
          trend="up"
        />
        <MetricCard
          title="Avg. Session Duration"
          value={formatDuration(data.overview.avgSessionDuration)}
          change="+5% from last period"
          icon={Clock}
          trend="up"
        />
        <MetricCard
          title="Bounce Rate"
          value={`${data.overview.bounceRate}%`}
          change="-2% from last period"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pages">Top Pages</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <TopItemsList
              title="Top Countries"
              items={data.overview.topCountries}
              renderItem={(item) => (
                <>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">{item.country || 'Unknown'}</span>
                  </div>
                  <Badge variant="secondary">{formatNumber(item.count)}</Badge>
                </>
              )}
            />

            <TopItemsList
              title="Devices"
              items={data.overview.topDevices}
              renderItem={(item) => {
                const DeviceIcon = item.device === 'mobile' ? Smartphone : 
                                 item.device === 'tablet' ? Tablet : Monitor
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <DeviceIcon className="h-4 w-4" />
                      <span className="text-sm capitalize">{item.device || 'Unknown'}</span>
                    </div>
                    <Badge variant="secondary">{formatNumber(item.count)}</Badge>
                  </>
                )
              }}
            />

            <TopItemsList
              title="Top Pages"
              items={data.overview.topPages}
              renderItem={(item) => (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.title || item.path}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.path}
                    </p>
                  </div>
                  <Badge variant="secondary">{formatNumber(item.views)}</Badge>
                </>
              )}
            />
          </div>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.overview.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{page.title || page.path}</h4>
                      <p className="text-sm text-muted-foreground truncate">{page.path}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatNumber(page.views)} views</p>
                      <p className="text-xs text-muted-foreground">#{index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.overview.topCountries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{country.country || 'Unknown'}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `${(country.count / Math.max(...data.overview.topCountries.map(c => c.count))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatNumber(country.count)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.overview.topDevices.map((device, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{device.device || 'Unknown'}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `${(device.count / Math.max(...data.overview.topDevices.map(d => d.count))) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatNumber(device.count)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Right Now</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">{data.realtime.activeUsers}</div>
                  <p className="text-sm text-muted-foreground">Active users</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.realtime.recentActions.slice(0, 5).map((action, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="truncate">{action.path}</span>
                    <span className="text-muted-foreground">{action.device}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}