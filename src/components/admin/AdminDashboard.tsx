'use client'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Users, FileText, Image, MessageSquare, TrendingUp, Eye, 
  Globe, Clock
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'


import EnterpriseAnalyticsDashboard from '../analytics/EnterpriseAnalyticsDashboard'

import CategoriesManagement from './CategoriesManagement'
import TagsManagement from './TagsManagement'
import UsersManagement from './UsersManagement'
// import ExtensiveAnalytics from './ExtensiveAnalytics' // Replaced with EnterpriseAnalyticsDashboard
import PostsManagement from './PostsManagement'

interface MediaItem {
  id: number
  source_url: string
  alt_text?: string
  title?: { rendered?: string }
}

interface CommentItem {
  id: number
  author_name: string
  author_email: string
  content?: { rendered?: string }
  post?: { title?: string }
  date: string
}

interface WordPressSettings {
  title?: string
  description?: string
  admin_email?: string
  language?: string
  posts_per_page?: number
}

export type SectionKey =
  | 'dashboard' | 'analytics' | 'posts' | 'media' | 'categories' | 'tags' | 'comments' | 'users' | 'settings' | 'plugins' | 'themes' | 'site-health' | 'debug'

interface DashboardStats {
  posts: { total: number, published: number, draft: number, pending: number }
  pages: { total: number, published: number, draft: number }
  users: { total: number, admins: number, editors: number, authors: number }
  comments: { total: number, approved: number, pending: number, spam: number }
  media: { total: number, images: number, videos: number, documents: number }
  categories: { total: number }
  tags: { total: number }
}

interface _AnalyticsResponse {
  summary: {
    views?: {
      total?: number
      today?: number
      change?: string
      series?: Array<{ date: string; views: number }>
    }
    devices?: Array<{ device: string; count: number }>
    countries?: Array<{ country: string; count: number }>
    referers?: Array<{ referer: string; count: number }>
  }
}

interface AnalyticsData {
  views?: { total?: number, today?: number, change?: string }
  visitors?: { total?: number, today?: number, change?: string }
  sessions?: { total?: number, avg_duration?: number }
  bounce_rate?: number
  top_pages?: Array<{ path: string, title: string, views: number }>
  top_countries?: Array<{ country: string, count: number }>
  devices?: Array<{ device: string, count: number }>
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  change, 
  icon: Icon, 
  trend,
  onClick 
}: {
  title: string
  value: string | number
  subtitle?: string
  change?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
  onClick?: () => void
}) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
  
  return (
    <Card className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" onClick={onClick}>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {change && (
          <p className={`text-xs ${trendColor} mt-1`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard({ sectionKey }: { sectionKey?: SectionKey }) {
  const validSectionKey = sectionKey || 'dashboard'

  const renderContent = () => {
    switch (validSectionKey) {
      case 'dashboard':
        return <DashboardOverview />
      case 'analytics':
        return <AnalyticsSection />
      case 'categories':
        return <CategoriesManagement />
      case 'tags':
        return <TagsManagement />
      case 'users':
        return <UsersManagement />
      case 'posts':
        return <PostsSection />
      case 'media':
        return <MediaManagement />
      case 'comments':
        return <CommentsManagement />
      case 'settings':
        return <SettingsManagement />
      default:
        return (
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground text-center py-12">
              {validSectionKey} features will be implemented soon.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold capitalize">
            {validSectionKey === 'site-health' ? 'Site Health' : validSectionKey}
          </h1>

        </div>
        {renderContent()}
      </div>
    </div>
  )
}

function DashboardOverview() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
    staleTime: 30000
  })

  const { data: analyticsResponse, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async (): Promise<_AnalyticsResponse> => {
      const response = await fetch('/api/analytics/summary')
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      console.log('📊 Analytics API Response:', data) // Debug logging
      return data
    },
    staleTime: 30000
  })

  // Transform the API response to match our component expectations
  const analytics: AnalyticsData | undefined = analyticsResponse?.summary ? {
    views: analyticsResponse.summary.views,
    visitors: { total: 0, today: 0, change: '+0%' }, // Mock data - not available in current API
    sessions: { total: 0, avg_duration: 0 }, // Mock data - not available in current API
    bounce_rate: 0, // Mock data - not available in current API
    top_pages: [], // Mock data - not available in current API
    top_countries: analyticsResponse.summary.countries?.map((c: { country?: string; count?: number }) => ({ country: c.country || 'Unknown', count: c.count || 0 })) || [],
    devices: analyticsResponse.summary.devices || []
  } : undefined

  if (statsLoading || analyticsLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Content Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Content Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Posts"
            value={stats?.posts.total || 0}
            subtitle={`${stats?.posts.published || 0} published, ${stats?.posts.draft || 0} drafts`}
            icon={FileText}
          />
          <MetricCard
            title="Pages"
            value={stats?.pages.total || 0}
            subtitle={`${stats?.pages.published || 0} published`}
            icon={FileText}
          />
          <MetricCard
            title="Media Files"
            value={stats?.media.total || 0}
            subtitle={`${stats?.media.images || 0} images, ${stats?.media.videos || 0} videos`}
            icon={Image}
          />
          <MetricCard
            title="Comments"
            value={stats?.comments.total || 0}
            subtitle={`${stats?.comments.pending || 0} pending approval`}
            icon={MessageSquare}
          />
        </div>
      </div>

      {/* Analytics Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Analytics Overview</h2>

        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Views"
            value={analytics?.views?.total || 0}
            subtitle={`${analytics?.views?.today || 0} today`}
            change={analytics?.views?.change}
            icon={Eye}
            trend="up"
            onClick={() => {/* Navigate to detailed analytics */}}
          />
          <MetricCard
            title="Unique Visitors"
            value={analytics?.visitors?.total || 0}
            subtitle={`${analytics?.visitors?.today || 0} today`}
            change={analytics?.visitors?.change}
            icon={Users}
            trend="up"
          />
          <MetricCard
            title="Avg. Session Duration"
            value={`${Math.floor((analytics?.sessions?.avg_duration || 0) / 60)}m`}
            subtitle="minutes per session"
            icon={Clock}
          />
          <MetricCard
            title="Bounce Rate"
            value={`${analytics?.bounce_rate || 0}%`}
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Top Performing Pages
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.top_pages?.slice(0, 5).map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{page.title || page.path}</p>
                    <p className="text-xs text-muted-foreground truncate">{page.path}</p>
                  </div>
                  <Badge variant="secondary">{page.views} views</Badge>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Top Countries
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.top_countries?.slice(0, 5).map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">{country.country}</span>
                  </div>
                  <Badge variant="secondary">{country.count}</Badge>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Analytics section with enhanced enterprise dashboard
function AnalyticsSection() {
  return <EnterpriseAnalyticsDashboard />
}

function PostsSection() {
  return <PostsManagement />
}

function MediaManagement() {
  const { data: media, isLoading } = useQuery<MediaItem[]>({
    queryKey: ['admin-media'],
    queryFn: async () => {
      const response = await fetch('/api/wp/media')
      if (!response.ok) throw new Error('Failed to fetch media')
      return response.json()
    }
  })

  if (isLoading) {
    return <div className="p-6">Loading media...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Media Library</h2>
        <Button>Upload Media</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media && media.length > 0 ? (
          media.map((item: MediaItem) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-square bg-muted">
                <img 
                  src={item.source_url} 
                  alt={item.alt_text || 'Media'}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-2">
                <p className="text-sm truncate">{item.title?.rendered || 'Untitled'}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No media files found
          </div>
        )}
      </div>
    </div>
  )
}

function CommentsManagement() {
  const { data: comments, isLoading } = useQuery<CommentItem[]>({
    queryKey: ['admin-comments'],
    queryFn: async () => {
      const response = await fetch('/api/wp/comments')
      if (!response.ok) throw new Error('Failed to fetch comments')
      return response.json()
    }
  })

  if (isLoading) {
    return <div className="p-6">Loading comments...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Comments Management</h2>
        <div className="flex gap-2">
          <Button variant="outline">Bulk Actions</Button>
          <Button>Moderate</Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {comments && comments.length > 0 ? (
              comments.map((comment: CommentItem) => (
                <div key={comment.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{comment.author_name}</span>
                        <span className="text-sm text-muted-foreground">{comment.author_email}</span>
                      </div>
                      <div className="text-sm mb-2" dangerouslySetInnerHTML={{ __html: comment.content?.rendered || '' }} />
                      <div className="text-xs text-muted-foreground">
                        On: {comment.post?.title} • {new Date(comment.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Approve</Button>
                      <Button size="sm" variant="destructive">Delete</Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No comments found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsManagement() {
  const { data: settings, isLoading } = useQuery<WordPressSettings>({
    queryKey: ['wp-settings'],
    queryFn: async () => {
      const response = await fetch('/api/wp/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      return response.json()
    }
  })

  if (isLoading) {
    return <div className="p-6">Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">WordPress Settings</h2>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Site Title</label>
                <p className="text-sm text-muted-foreground">{settings?.title || 'Loading...'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Tagline</label>
                <p className="text-sm text-muted-foreground">{settings?.description || 'Loading...'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Admin Email</label>
                <p className="text-sm text-muted-foreground">{settings?.admin_email || 'Loading...'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Site Language</label>
                <p className="text-sm text-muted-foreground">{settings?.language || 'en_US'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reading Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Posts per page</label>
                <p className="text-sm text-muted-foreground">{settings?.posts_per_page || 10}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
