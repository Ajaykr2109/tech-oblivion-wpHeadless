'use client'
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Eye, Users, Clock, TrendingUp, TrendingDown, Smartphone, Monitor, 
  Tablet, BarChart3, Activity, Zap, Target,
  Download, RefreshCw, ChevronRight
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge' // Unused for now
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import DummyDataIndicator from '@/components/ui/dummy-data-indicator'
// import { Separator } from '@/components/ui/separator' // Unused for now

// Types for comprehensive analytics data
interface AnalyticsOverview {
  totalViews: number
  uniqueVisitors: number
  pageViews: number
  avgSessionDuration: number
  bounceRate: number
  conversionRate: number
  totalSessions: number
  returnVisitorRate: number
  avgPageLoadTime: number
  exitRate: number
}

interface TimeSeriesData {
  date: string
  views: number
  visitors: number
  sessions: number
  bounceRate: number
  avgDuration: number
}

interface PagePerformance {
  path: string
  title: string
  views: number
  uniqueViews: number
  avgTimeOnPage: number
  bounceRate: number
  exitRate: number
  entrances: number
  conversions: number
}

interface AudienceInsights {
  countries: Array<{ country: string; code: string; count: number; percentage: number }>
  devices: Array<{ device: string; count: number; percentage: number }>
  browsers: Array<{ browser: string; version: string; count: number; percentage: number }>
  operatingSystems: Array<{ os: string; count: number; percentage: number }>
  screenResolutions: Array<{ resolution: string; count: number; percentage: number }>
  languages: Array<{ language: string; count: number; percentage: number }>
}

interface TrafficSources {
  referrers: Array<{ source: string; medium: string; count: number; percentage: number }>
  socialMedia: Array<{ platform: string; count: number; percentage: number }>
  searchEngines: Array<{ engine: string; count: number; percentage: number }>
  directTraffic: number
  emailTraffic: number
}

interface RealTimeData {
  activeUsers: number
  currentSessions: Array<{
    sessionId: string
    userId?: string
    currentPage: string
    duration: number
    country: string
    device: string
    referrer: string
  }>
  recentActivity: Array<{
    type: 'pageview' | 'session_start' | 'session_end'
    path: string
    timestamp: string
    country: string
    device: string
    sessionDuration?: number
  }>
  topActivePages: Array<{ path: string; activeUsers: number }>
}

interface UserBehavior {
  userFlow: Array<{
    fromPage: string
    toPage: string
    count: number
    dropOffRate: number
  }>
  scrollDepth: Array<{
    page: string
    avgScrollDepth: number
    completion25: number
    completion50: number
    completion75: number
    completion100: number
  }>
  sessionPatterns: Array<{
    sessionLength: string
    count: number
    percentage: number
  }>
}

interface PerformanceMetrics {
  loadTimes: Array<{
    page: string
    avgLoadTime: number
    medianLoadTime: number
    p95LoadTime: number
  }>
  coreWebVitals: {
    lcp: number // Largest Contentful Paint
    fid: number // First Input Delay
    cls: number // Cumulative Layout Shift
    fcp: number // First Contentful Paint
  }
  devicePerformance: Array<{
    deviceType: string
    avgLoadTime: number
    errorRate: number
  }>
}

interface ComprehensiveAnalytics {
  overview: AnalyticsOverview
  timeSeries: TimeSeriesData[]
  pages: PagePerformance[]
  audience: AudienceInsights
  traffic: TrafficSources
  realTime: RealTimeData
  behavior: UserBehavior
  performance: PerformanceMetrics
}

// Metric Card Component with enhanced styling
interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  subtitle?: string
  className?: string
  onClick?: () => void
}

function MetricCard({ title, value, change, trend = 'neutral', icon: Icon, subtitle, className = '', onClick }: MetricCardProps) {
  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : BarChart3
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
  const TrendIcon = trendIcon

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {change && (
          <div className={`flex items-center text-xs mt-2 ${trendColor}`}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Progress bar with label
function ProgressWithLabel({ label, value, total, className = '' }: { 
  label: string
  value: number
  total: number
  className?: string
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toLocaleString()}</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="text-xs text-muted-foreground text-right">{percentage.toFixed(1)}%</div>
    </div>
  )
}

// Main Dashboard Component
export default function EnterpriseAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d')
  const [activeTab, setActiveTab] = useState('overview')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch comprehensive analytics data
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['enterprise-analytics', timeRange],
    queryFn: async (): Promise<ComprehensiveAnalytics> => {
      const response = await fetch(`/api/analytics/comprehensive?period=${timeRange}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      return response.json()
    },
    staleTime: 60000,
    refetchInterval: autoRefresh ? 30000 : false,
  })

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`
    return `${remainingSeconds}s`
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <Card className="m-6">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-lg font-medium mb-2">Analytics Unavailable</h3>
            <p className="text-sm mb-4">
              {error instanceof Error ? error.message : 'Failed to load analytics data'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Enterprise Analytics</h1>
            <DummyDataIndicator 
              type="badge" 
              message="Analytics contains real page views/countries/devices but mock behavior and performance data"
            />
          </div>
          <p className="text-muted-foreground">
            Comprehensive insights and performance metrics for your content platform
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'text-green-600' : ''}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 3 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Page Views"
          value={formatNumber(analytics.overview.totalViews)}
          change="+12.5% vs last period"
          trend="up"
          icon={Eye}
          subtitle="All page visits"
        />
        <MetricCard
          title="Unique Visitors"
          value={formatNumber(analytics.overview.uniqueVisitors)}
          change="+8.2% vs last period"
          trend="up"
          icon={Users}
          subtitle="Individual users"
        />
        <MetricCard
          title="Avg. Session Duration"
          value={formatDuration(analytics.overview.avgSessionDuration)}
          change="+5.1% vs last period"
          trend="up"
          icon={Clock}
          subtitle="Time per session"
        />
        <MetricCard
          title="Bounce Rate"
          value={formatPercentage(analytics.overview.bounceRate)}
          change="-2.3% vs last period"
          trend="up"
          icon={Target}
          subtitle="Single page sessions"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Sessions"
          value={formatNumber(analytics.overview.totalSessions)}
          change="+9.7% vs last period"
          trend="up"
          icon={Activity}
        />
        <MetricCard
          title="Return Visitor Rate"
          value={formatPercentage(analytics.overview.returnVisitorRate)}
          change="+3.4% vs last period"
          trend="up"
          icon={TrendingUp}
        />
        <MetricCard
          title="Avg. Load Time"
          value={`${analytics.overview.avgPageLoadTime.toFixed(2)}s`}
          change="-0.3s vs last period"
          trend="up"
          icon={Zap}
        />
        <MetricCard
          title="Conversion Rate"
          value={formatPercentage(analytics.overview.conversionRate)}
          change="+1.2% vs last period"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Traffic Timeline Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Traffic Timeline
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 mb-2" />
                    <p>Time series chart would go here</p>
                    <p className="text-xs">Views, Sessions, and Bounce Rate over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Top Performing Pages
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.pages.slice(0, 6).map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{page.title || page.path}</p>
                      <p className="text-sm text-muted-foreground truncate">{page.path}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Bounce: {formatPercentage(page.bounceRate)}</span>
                        <span>Time: {formatDuration(page.avgTimeOnPage)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{formatNumber(page.views)}</div>
                      <div className="text-xs text-muted-foreground">views</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.audience.countries.slice(0, 5).map((country, index) => (
                  <ProgressWithLabel
                    key={index}
                    label={country.country}
                    value={country.count}
                    total={analytics.audience.countries[0]?.count || 1}
                  />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.audience.devices.map((device, index) => {
                  const DeviceIcon = device.device === 'mobile' ? Smartphone : 
                                   device.device === 'tablet' ? Tablet : Monitor
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DeviceIcon className="h-4 w-4" />
                        <span className="text-sm capitalize">{device.device}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(device.count)}</div>
                        <div className="text-xs text-muted-foreground">{formatPercentage(device.percentage)}</div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Direct</span>
                  <div className="text-right">
                    <div className="font-medium">{formatNumber(analytics.traffic.directTraffic)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage((analytics.traffic.directTraffic / analytics.overview.totalSessions) * 100)}
                    </div>
                  </div>
                </div>
                {analytics.traffic.referrers.slice(0, 4).map((referrer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm truncate">{referrer.source}</span>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(referrer.count)}</div>
                      <div className="text-xs text-muted-foreground">{formatPercentage(referrer.percentage)}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Additional tabs would be implemented here */}
        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <DummyDataIndicator 
            type="banner" 
            message="Audience data: Geographic distribution uses real data, but browser, OS, screen resolution, and language data are mock values for demonstration."
            className="mb-6"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.audience.countries.slice(0, 8).map((country, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-4 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                        {country.code}
                      </div>
                      <span className="font-medium">{country.country}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(country.count)}</div>
                      <div className="text-xs text-muted-foreground">{formatPercentage(country.percentage)}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Technology Breakdown */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Technology Breakdown</CardTitle>
                  <DummyDataIndicator 
                    type="dot" 
                    message="Browser and OS data are mock values"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Browsers */}
                <div>
                  <h4 className="font-medium mb-3">Browsers</h4>
                  <div className="space-y-2">
                    {analytics.audience.browsers.map((browser, index) => (
                      <ProgressWithLabel
                        key={index}
                        label={`${browser.browser} ${browser.version}`}
                        value={browser.count}
                        total={analytics.audience.browsers[0]?.count || 1}
                      />
                    ))}
                  </div>
                </div>

                {/* Operating Systems */}
                <div>
                  <h4 className="font-medium mb-3">Operating Systems</h4>
                  <div className="space-y-2">
                    {analytics.audience.operatingSystems.map((os, index) => (
                      <ProgressWithLabel
                        key={index}
                        label={os.os}
                        value={os.count}
                        total={analytics.audience.operatingSystems[0]?.count || 1}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Screen Resolutions and Languages */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Screen Resolutions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.audience.screenResolutions.map((resolution, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-mono">{resolution.resolution}</span>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(resolution.count)}</div>
                      <div className="text-xs text-muted-foreground">{formatPercentage(resolution.percentage)}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.audience.languages.map((language, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{language.language}</span>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(language.count)}</div>
                      <div className="text-xs text-muted-foreground">{formatPercentage(language.percentage)}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Performance Tab */}
        <TabsContent value="content" className="space-y-6">
          <DummyDataIndicator 
            type="banner" 
            message="Content performance data contains mock page analytics, bounce rates, and conversion metrics."
            className="mb-6"
          />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Content Performance Analysis
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.pages.map((page, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{page.title || page.path}</h4>
                        <p className="text-sm text-muted-foreground truncate">{page.path}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{formatNumber(page.views)}</div>
                        <div className="text-xs text-muted-foreground">Total Views</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                      <div>
                        <div className="font-semibold">{formatNumber(page.uniqueViews)}</div>
                        <div className="text-xs text-muted-foreground">Unique Views</div>
                      </div>
                      <div>
                        <div className="font-semibold">{formatDuration(page.avgTimeOnPage)}</div>
                        <div className="text-xs text-muted-foreground">Avg. Time</div>
                      </div>
                      <div>
                        <div className="font-semibold">{formatPercentage(page.bounceRate)}</div>
                        <div className="text-xs text-muted-foreground">Bounce Rate</div>
                      </div>
                      <div>
                        <div className="font-semibold">{formatPercentage(page.exitRate)}</div>
                        <div className="text-xs text-muted-foreground">Exit Rate</div>
                      </div>
                      <div>
                        <div className="font-semibold">{page.conversions}</div>
                        <div className="text-xs text-muted-foreground">Conversions</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Sources Tab */}
        <TabsContent value="traffic" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Referrers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Referrers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Direct Traffic</span>
                  <div className="text-right">
                    <div className="font-semibold">{formatNumber(analytics.traffic.directTraffic)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatPercentage((analytics.traffic.directTraffic / analytics.overview.totalSessions) * 100)}
                    </div>
                  </div>
                </div>
                {analytics.traffic.referrers.slice(0, 6).map((referrer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{referrer.source}</div>
                      <div className="text-xs text-muted-foreground">{referrer.medium}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatNumber(referrer.count)}</div>
                      <div className="text-xs text-muted-foreground">{formatPercentage(referrer.percentage)}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Social Media & Search */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Traffic</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.traffic.socialMedia.map((social, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{social.platform}</span>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(social.count)}</div>
                        <div className="text-xs text-muted-foreground">{formatPercentage(social.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Search Engines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics.traffic.searchEngines.map((engine, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{engine.engine}</span>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(engine.count)}</div>
                        <div className="text-xs text-muted-foreground">{formatPercentage(engine.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* User Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <DummyDataIndicator 
            type="banner" 
            message="User behavior analytics including user flow, scroll depth, and session patterns are entirely mock data."
            className="mb-6"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {/* User Flow */}
            <Card>
              <CardHeader>
                <CardTitle>User Flow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.behavior.userFlow.map((flow, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm">
                        <span className="font-medium">{flow.fromPage}</span>
                        <ChevronRight className="inline h-4 w-4 mx-2" />
                        <span className="font-medium">{flow.toPage}</span>
                      </div>
                      <div className="text-sm font-semibold">{formatNumber(flow.count)} users</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Drop-off rate: {formatPercentage(flow.dropOffRate)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Scroll Depth */}
            <Card>
              <CardHeader>
                <CardTitle>Scroll Depth Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.behavior.scrollDepth.map((scroll, index) => (
                  <div key={index} className="space-y-2">
                    <div className="font-medium text-sm">{scroll.page}</div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-semibold">{scroll.completion25}%</div>
                        <div className="text-muted-foreground">25%</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{scroll.completion50}%</div>
                        <div className="text-muted-foreground">50%</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{scroll.completion75}%</div>
                        <div className="text-muted-foreground">75%</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{scroll.completion100}%</div>
                        <div className="text-muted-foreground">100%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Session Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Session Length Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {analytics.behavior.sessionPatterns.map((pattern, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{formatPercentage(pattern.percentage)}</div>
                    <div className="text-sm text-muted-foreground">{pattern.sessionLength}</div>
                    <div className="text-xs text-muted-foreground">{formatNumber(pattern.count)} sessions</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <DummyDataIndicator 
            type="banner" 
            message="Performance metrics including Core Web Vitals, load times, and device performance are mock data."
            className="mb-6"
          />
          <div className="grid gap-6">
            {/* Core Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analytics.performance.coreWebVitals.lcp}s</div>
                    <div className="text-sm font-medium">LCP</div>
                    <div className="text-xs text-muted-foreground">Largest Contentful Paint</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analytics.performance.coreWebVitals.fid}ms</div>
                    <div className="text-sm font-medium">FID</div>
                    <div className="text-xs text-muted-foreground">First Input Delay</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analytics.performance.coreWebVitals.cls}</div>
                    <div className="text-sm font-medium">CLS</div>
                    <div className="text-xs text-muted-foreground">Cumulative Layout Shift</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analytics.performance.coreWebVitals.fcp}s</div>
                    <div className="text-sm font-medium">FCP</div>
                    <div className="text-xs text-muted-foreground">First Contentful Paint</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Page Load Times */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Page Load Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics.performance.loadTimes.map((loadTime, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="font-medium mb-2">{loadTime.page}</div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="font-semibold">{loadTime.avgLoadTime}s</div>
                          <div className="text-xs text-muted-foreground">Average</div>
                        </div>
                        <div>
                          <div className="font-semibold">{loadTime.medianLoadTime}s</div>
                          <div className="text-xs text-muted-foreground">Median</div>
                        </div>
                        <div>
                          <div className="font-semibold">{loadTime.p95LoadTime}s</div>
                          <div className="text-xs text-muted-foreground">95th percentile</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analytics.performance.devicePerformance.map((device, index) => {
                    const DeviceIcon = device.deviceType === 'mobile' ? Smartphone : 
                                     device.deviceType === 'tablet' ? Tablet : Monitor
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <DeviceIcon className="h-5 w-5" />
                          <span className="font-medium capitalize">{device.deviceType}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{device.avgLoadTime}s</div>
                          <div className="text-xs text-muted-foreground">
                            {formatPercentage(device.errorRate)} error rate
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <DummyDataIndicator 
            type="banner" 
            message="Real-time analytics including active users and recent activity are simulated with mock data."
            className="mb-6"
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Active Users */}
            <Card>
              <CardHeader>
                <CardTitle>Right Now</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {analytics.realTime.activeUsers}
                </div>
                <div className="text-muted-foreground">Active users in the last 5 minutes</div>
                <div className="mt-4 flex justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>

            {/* Top Active Pages */}
            <Card>
              <CardHeader>
                <CardTitle>Top Active Pages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.realTime.topActivePages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm truncate">{page.path}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">{page.activeUsers}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.realTime.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 text-xs">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'pageview' ? 'bg-blue-500' :
                      activity.type === 'session_start' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{activity.path}</div>
                      <div className="text-muted-foreground">{activity.country} • {activity.device}</div>
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Live Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="mx-auto h-8 w-8 mb-2" />
                <p>Live activity feed would show real-time user interactions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}