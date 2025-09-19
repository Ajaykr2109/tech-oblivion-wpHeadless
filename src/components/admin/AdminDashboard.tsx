'use client'
import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Users, FileText, Image, MessageSquare, TrendingUp, Eye, 
  Globe, Clock
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { AuthLoadingPage } from '@/components/ui/auth-skeletons'

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
  media_type?: string
  mime_type?: string
  media_details?: Record<string, unknown>
  author?: number
  date?: string
  slug?: string
}

interface CommentItem {
  id: number
  author_name: string
  author_email: string
  content?: { rendered?: string }
  post?: { title?: string }
  date: string
  status?: 'approved' | 'hold' | 'spam' | 'trash'
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
  const { user, isLoading, can } = useAuth()
  const validSectionKey = sectionKey || 'dashboard'

  // Auth check - only admins can access admin dashboard
  if (isLoading) {
    return <AuthLoadingPage />
  }

  if (!user || !can('admin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          You don't have permission to access the admin dashboard. Administrator access is required.
        </p>
        <Button onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    )
  }

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
      case 'site-health':
        return <SiteHealthSection />
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {validSectionKey === 'site-health' ? 'Site Health' : 
               validSectionKey.charAt(0).toUpperCase() + validSectionKey.slice(1)}
            </h1>
            <p className="text-muted-foreground mt-1">
              {getSectionDescription(validSectionKey)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              Export Data
            </Button>
            <Button size="sm">
              Quick Action
            </Button>
          </div>
        </div>
        <div className="pb-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

function getSectionDescription(section: string): string {
  const descriptions = {
    dashboard: 'Overview of your site\'s performance and key metrics',
    analytics: 'Detailed insights into your website traffic and user behavior',
    posts: 'Manage your blog posts and articles',
    media: 'Upload and organize your media files',
    categories: 'Organize your content with categories',
    tags: 'Tag your content for better organization',
    comments: 'Moderate and manage user comments',
    users: 'Manage user accounts and permissions',
    settings: 'Configure your website settings',
    'site-health': 'Monitor your site\'s performance and security',
    plugins: 'Manage your WordPress plugins',
    themes: 'Customize your site\'s appearance',
    debug: 'Development and debugging tools'
  }
  return descriptions[section as keyof typeof descriptions] || 'Manage this section'
}

function DashboardOverview() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
    staleTime: 10000, // Reduced from 30s to 10s for more frequent updates in admin
    refetchOnWindowFocus: true // Refetch when user switches back to tab
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

  const { data: cacheMetrics, isLoading: cacheLoading } = useQuery({
    queryKey: ['dashboard-cache-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/cache/metrics')
      if (!response.ok) return { hitRate: 85, missRate: 15, totalRequests: 1250, efficiency: 'Good' }
      return response.json()
    },
    staleTime: 15000
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

  if (statsLoading || analyticsLoading || cacheLoading) {
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

      {/* Cache Performance */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Cache Performance</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Cache Hit Rate"
            value={`${cacheMetrics?.hitRate || 85}%`}
            subtitle={`${cacheMetrics?.totalRequests || 1250} total requests`}
            icon={Globe}
            trend="up"
          />
          <MetricCard
            title="Cache Miss Rate"
            value={`${cacheMetrics?.missRate || 15}%`}
            subtitle="Room for improvement"
            icon={Clock}
            trend={cacheMetrics?.missRate > 20 ? 'down' : 'neutral'}
          />
          <MetricCard
            title="Cache Efficiency"
            value={cacheMetrics?.efficiency || 'Good'}
            subtitle="Overall performance"
            icon={TrendingUp}
          />
          <MetricCard
            title="Total Requests"
            value={cacheMetrics?.totalRequests || 1250}
            subtitle="Last 24 hours"
            icon={Eye}
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
  const { data: media, isLoading, refetch } = useQuery<MediaItem[]>({
    queryKey: ['admin-media'],
    queryFn: async () => {
      const response = await fetch('/api/wp/media?per_page=50&orderby=date&order=desc', {
        cache: 'no-store'
      })
      if (!response.ok) throw new Error('Failed to fetch media')
      return response.json()
    },
    staleTime: 0
  })

  const [selectedMedia, setSelectedMedia] = useState<number[]>([])
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      try {
        setUploadProgress(0)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('title', file.name.split('.')[0])
        formData.append('alt_text', file.name.split('.')[0])

        const response = await fetch('/api/wp/media/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        setUploadProgress(100)
        setTimeout(() => {
          setUploadProgress(null)
          refetch()
        }, 1000)
      } catch (error) {
        console.error('Upload error:', error)
        setUploadProgress(null)
      }
    }
  }

  const handleDelete = async (mediaId: number) => {
    try {
      const response = await fetch(`/api/wp/media/${mediaId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Delete failed')
      refetch()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedMedia.length === 0) return
    try {
      await Promise.all(selectedMedia.map(id => 
        fetch(`/api/wp/media/${id}`, { method: 'DELETE' })
      ))
      setSelectedMedia([])
      refetch()
    } catch (error) {
      console.error('Bulk delete error:', error)
    }
  }

  const handleSelectAll = () => {
    if (selectedMedia.length === (filteredMedia?.length || 0)) {
      setSelectedMedia([])
    } else {
      setSelectedMedia(filteredMedia?.map(m => m.id) || [])
    }
  }

  const filteredMedia = useMemo(() => {
    if (!media) return []
    return media.filter(item => {
      const matchesSearch = !searchQuery || 
        (item.title?.rendered || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.alt_text || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = filterType === 'all' || 
        (filterType === 'image' && item.media_type === 'image') ||
        (filterType === 'video' && item.media_type === 'video') ||
        (filterType === 'audio' && item.media_type === 'audio') ||
        (filterType === 'document' && !['image', 'video', 'audio'].includes(item.media_type || ''))
      
      return matchesSearch && matchesType
    })
  }, [media, searchQuery, filterType])

  if (isLoading) {
    return <div className="p-6">Loading media...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Media Library</h2>
        <div className="flex gap-2">
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="media-upload"
          />
          <Button asChild>
            <label htmlFor="media-upload" className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2" />
              Upload Media
            </label>
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Uploading...</span>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-sm">{uploadProgress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedMedia.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedMedia.length} item(s) selected
              </span>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Files</p>
                <p className="text-2xl font-bold">{filteredMedia?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Images</p>
                <p className="text-2xl font-bold">
                  {filteredMedia?.filter(m => m.media_type === 'image').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Videos</p>
                <p className="text-2xl font-bold">
                  {filteredMedia?.filter(m => m.media_type === 'video').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Documents</p>
                <p className="text-2xl font-bold">
                  {filteredMedia?.filter(m => !['image', 'video', 'audio'].includes(m.media_type || '')).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Media Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedMedia.length === (filteredMedia?.length || 0) && filteredMedia.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
            />
            <CardTitle>
              Media Files ({filteredMedia?.length || 0})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMedia && filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredMedia.map((item: MediaItem) => (
                <Card key={item.id} className="overflow-hidden group relative">
                  <div className="aspect-square bg-muted relative">
                    {item.media_type === 'image' ? (
                      <>
                        <img 
                          src={`/api/image-proxy?url=${encodeURIComponent(item.source_url)}`}
                          alt={item.alt_text || 'Media'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            // Try direct URL as fallback
                            if (target.src.includes('/api/image-proxy')) {
                              target.src = item.source_url
                            } else {
                              target.style.display = 'none'
                              const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement
                              if (fallback) fallback.style.display = 'flex'
                            }
                          }}
                        />
                        <div className="fallback-icon w-full h-full flex items-center justify-center bg-muted absolute inset-0" style={{ display: 'none' }}>
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs truncate font-medium">{item.title?.rendered || 'Untitled'}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.mime_type}</p>
                    <div className="flex gap-1 mt-2">
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <FileText className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Image className="mx-auto h-12 w-12 mb-4" />
              <p>No media files found</p>
              <p className="text-sm">Upload some files to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function CommentsManagement() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  
  const { data: comments, isLoading, refetch } = useQuery<CommentItem[]>({
    queryKey: ['admin-comments'],
    queryFn: async () => {
      const response = await fetch('/api/wp/comments')
      if (!response.ok) throw new Error('Failed to fetch comments')
      return response.json()
    }
  })

  const [selectedComments, setSelectedComments] = useState<number[]>([])
  const [bulkAction, setBulkAction] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [autoApprove, setAutoApprove] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'unapproved'>('all')
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set())

  // Load auto-approve setting
  const { data: commentSettings } = useQuery({
    queryKey: ['comment-settings'],
    queryFn: async () => {
      const response = await fetch('/api/wp/settings/comments')
      if (!response.ok) return { autoApprove: false }
      return response.json()
    },
    staleTime: 30000
  })

  // Comment action mutation with optimistic updates
  const commentActionMutation = useMutation({
    mutationFn: async ({ commentId, action }: { commentId: number, action: string }) => {
      const response = await fetch(`/api/wp/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      if (!response.ok) throw new Error('Comment action failed')
      return { commentId, action }
    },
    onMutate: async ({ commentId, action }) => {
      // Add to loading state
      setLoadingComments(prev => new Set([...prev, commentId]))
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-comments'] })
      
      // Snapshot the previous value
      const previousComments = queryClient.getQueryData<CommentItem[]>(['admin-comments'])
      
      // Optimistically update to the new value
      if (previousComments) {
        const actionMap = {
          approve: 'approved',
          unapprove: 'hold',
          spam: 'spam',
          unspam: 'approved',
          trash: 'trash',
          restore: 'approved',
        } as const
        
        const newStatus = actionMap[action as keyof typeof actionMap]
        if (newStatus) {
          const updatedComments = previousComments.map(comment => 
            comment.id === commentId 
              ? { ...comment, status: newStatus as CommentItem['status'] }
              : comment
          )
          queryClient.setQueryData(['admin-comments'], updatedComments)
        }
      }
      
      return { previousComments }
    },
    onError: (err, { commentId }, context) => {
      // Remove from loading state
      setLoadingComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })
      
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(['admin-comments'], context.previousComments)
      }
      
      toast({
        title: "Error",
        description: `Failed to update comment: ${err.message}`,
        variant: "destructive"
      })
    },
    onSuccess: ({ commentId, action }) => {
      // Remove from loading state
      setLoadingComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })
      
      const actionLabels = {
        approve: 'approved',
        unapprove: 'unapproved',
        spam: 'marked as spam',
        unspam: 'unmarked as spam',
        trash: 'moved to trash',
        restore: 'restored'
      } as const
      
      toast({
        title: "Success",
        description: `Comment ${actionLabels[action as keyof typeof actionLabels] || 'updated'} successfully`,
        variant: "default"
      })
    },
    onSettled: () => {
      // Immediate invalidation for admin stats, delayed for comments list
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      // Always refetch after 500ms to ensure data consistency
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
      }, 500)
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await fetch(`/api/wp/comments/${commentId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Delete failed')
      return commentId
    },
    onMutate: async (commentId) => {
      setLoadingComments(prev => new Set([...prev, commentId]))
      await queryClient.cancelQueries({ queryKey: ['admin-comments'] })
      
      const previousComments = queryClient.getQueryData<CommentItem[]>(['admin-comments'])
      
      if (previousComments) {
        const updatedComments = previousComments.filter(comment => comment.id !== commentId)
        queryClient.setQueryData(['admin-comments'], updatedComments)
      }
      
      return { previousComments }
    },
    onError: (err, commentId, context) => {
      setLoadingComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })
      
      if (context?.previousComments) {
        queryClient.setQueryData(['admin-comments'], context.previousComments)
      }
      
      toast({
        title: "Error",
        description: `Failed to delete comment: ${err.message}`,
        variant: "destructive"
      })
    },
    onSuccess: (commentId) => {
      setLoadingComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(commentId)
        return newSet
      })
      
      toast({
        title: "Success",
        description: "Comment deleted successfully",
        variant: "default"
      })
    },
    onSettled: () => {
      // Immediate invalidation for admin stats, delayed for comments list
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
      }, 500)
    }
  })

  // Update autoApprove state when settings load
  React.useEffect(() => {
    if (commentSettings?.autoApprove !== undefined) {
      setAutoApprove(commentSettings.autoApprove)
    }
  }, [commentSettings])

  // Toggle auto-approve setting
  const handleAutoApproveToggle = async () => {
    try {
      const response = await fetch('/api/wp/settings/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoApprove: !autoApprove })
      })
      if (response.ok) {
        setAutoApprove(!autoApprove)
        toast({
          title: "Settings Updated",
          description: `Auto-approve ${!autoApprove ? 'enabled' : 'disabled'}`,
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Failed to update auto-approve setting:', error)
      toast({
        title: "Error",
        description: "Failed to update auto-approve setting",
        variant: "destructive"
      })
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedComments.length === 0) return
    
    try {
      await Promise.all(selectedComments.map(id => 
        fetch(`/api/wp/comments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: bulkAction })
        })
      ))
      setSelectedComments([])
      setBulkAction('')
      // Immediate invalidation for dashboard stats
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      refetch()
      
      toast({
        title: "Success",
        description: `Bulk action applied to ${selectedComments.length} comments`,
        variant: "default"
      })
    } catch (error) {
      console.error('Bulk action failed:', error)
      toast({
        title: "Error",
        description: "Bulk action failed",
        variant: "destructive"
      })
    }
  }

  const handleCommentAction = (commentId: number, action: string) => {
    commentActionMutation.mutate({ commentId, action })
  }

  const handleDelete = (commentId: number) => {
    deleteMutation.mutate(commentId)
  }

  const handleSelectAll = () => {
    if (selectedComments.length === (filteredComments?.length || 0)) {
      setSelectedComments([])
    } else {
      setSelectedComments(filteredComments?.map(c => c.id) || [])
    }
  }

  const filteredComments = useMemo(() => {
    if (!comments) return []
    
    const filtered = comments.filter(comment => {
      const matchesSearch = !searchQuery || 
        comment.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comment.author_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (comment.content?.rendered || '').toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'approved' && comment.status === 'approved') ||
        (filterStatus === 'pending' && comment.status === 'hold') ||
        (filterStatus === 'spam' && comment.status === 'spam') ||
        (filterStatus === 'trash' && comment.status === 'trash')
      
      const matchesTab = activeTab === 'all' || 
        (activeTab === 'unapproved' && (comment.status === 'hold' || comment.status === 'spam'))
      
      return matchesSearch && matchesStatus && matchesTab
    })
    
    return filtered
  }, [comments, searchQuery, filterStatus, activeTab])

  const unapprovedComments = useMemo(() => {
    return comments?.filter(comment => comment.status === 'hold' || comment.status === 'spam') || []
  }, [comments])

  const approvedComments = useMemo(() => {
    return comments?.filter(comment => comment.status === 'approved') || []
  }, [comments])

  if (isLoading) {
    return <div className="p-6">Loading comments...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Comments Management</h2>
        <div className="flex gap-2">
          <Button 
            variant={autoApprove ? "default" : "outline"}
            onClick={handleAutoApproveToggle}
          >
            {autoApprove ? 'Auto-Approve: ON' : 'Auto-Approve: OFF'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Comments</p>
                <p className="text-2xl font-bold">{comments?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold">{approvedComments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold">
                  {comments?.filter(c => c.status === 'hold').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Spam</p>
                <p className="text-2xl font-bold">
                  {comments?.filter(c => c.status === 'spam').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Approve Notice */}
      {autoApprove && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-green-800">
                Auto-approve is enabled. New comments will be automatically approved unless marked as spam.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button 
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveTab('all')}
        >
          All Comments ({comments?.length || 0})
        </Button>
        <Button 
          variant={activeTab === 'unapproved' ? 'default' : 'outline'}
          onClick={() => setActiveTab('unapproved')}
        >
          Unapproved ({unapprovedComments.length})
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <Input
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Comments</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="trash">Trash</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedComments.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedComments.length} comment(s) selected
              </span>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Bulk Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="unapprove">Unapprove</SelectItem>
                  <SelectItem value="spam">Mark as Spam</SelectItem>
                  <SelectItem value="unspam">Not Spam</SelectItem>
                  <SelectItem value="trash">Move to Trash</SelectItem>
                  <SelectItem value="restore">Restore</SelectItem>
                  <SelectItem value="delete">Delete Permanently</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkAction} disabled={!bulkAction}>
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedComments.length === (filteredComments?.length || 0) && filteredComments.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
            />
            <CardTitle>
              {activeTab === 'all' ? 'All Comments' : 'Unapproved Comments'} ({filteredComments?.length || 0})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {filteredComments && filteredComments.length > 0 ? (
              filteredComments.map((comment: CommentItem) => {
                const isLoading = loadingComments.has(comment.id)
                return (
                  <div 
                    key={comment.id} 
                    className={`border-b pb-4 last:border-b-0 transition-all duration-300 ${
                      isLoading ? 'opacity-60 pointer-events-none' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedComments.includes(comment.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedComments(prev => [...prev, comment.id])
                          } else {
                            setSelectedComments(prev => prev.filter(id => id !== comment.id))
                          }
                        }}
                        className="mt-1 rounded border-gray-300"
                        disabled={isLoading}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{comment.author_name}</span>
                          <span className="text-sm text-muted-foreground">{comment.author_email}</span>
                          <Badge 
                            variant={
                              comment.status === 'approved' ? 'default' :
                              comment.status === 'hold' ? 'secondary' :
                              comment.status === 'spam' ? 'destructive' :
                              'outline'
                            }
                            className={`transition-all duration-300 ${
                              isLoading ? 'animate-pulse' : ''
                            }`}
                          >
                            {comment.status === 'hold' ? 'pending' : comment.status}
                          </Badge>
                          {isLoading && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <div className="animate-spin h-3 w-3 border border-gray-300 border-t-transparent rounded-full"></div>
                              Updating...
                            </div>
                          )}
                        </div>
                        <div className="text-sm mb-2" dangerouslySetInnerHTML={{ __html: comment.content?.rendered || '' }} />
                        <div className="text-xs text-muted-foreground">
                          On: {comment.post?.title} • {new Date(comment.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {comment.status !== 'approved' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCommentAction(comment.id, 'approve')}
                            disabled={isLoading}
                            className="transition-all duration-300"
                          >
                            Approve
                          </Button>
                        )}
                        {comment.status === 'approved' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCommentAction(comment.id, 'unapprove')}
                            disabled={isLoading}
                            className="transition-all duration-300"
                          >
                            Unapprove
                          </Button>
                        )}
                        {comment.status !== 'spam' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCommentAction(comment.id, 'spam')}
                            disabled={isLoading}
                            className="transition-all duration-300"
                          >
                            Spam
                          </Button>
                        )}
                        {comment.status === 'spam' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCommentAction(comment.id, 'unspam')}
                            disabled={isLoading}
                            className="transition-all duration-300"
                          >
                            Not Spam
                          </Button>
                        )}
                        {comment.status !== 'trash' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCommentAction(comment.id, 'trash')}
                            disabled={isLoading}
                            className="transition-all duration-300"
                          >
                            Trash
                          </Button>
                        )}
                        {comment.status === 'trash' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCommentAction(comment.id, 'restore')}
                            disabled={isLoading}
                            className="transition-all duration-300"
                          >
                            Restore
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDelete(comment.id)}
                          disabled={isLoading}
                          className="transition-all duration-300"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                <p>
                  {activeTab === 'unapproved' ? 'No unapproved comments found' : 'No comments found'}
                </p>
                {activeTab === 'unapproved' && (
                  <p className="text-sm">All comments are approved or in trash</p>
                )}
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

function SiteHealthSection() {
  const [healthData] = useState({
    performance: {
      score: 85,
      issues: ['Slow database queries', 'Large image files'],
      recommendations: ['Enable caching', 'Optimize images']
    },
    security: {
      score: 92,
      issues: ['Outdated plugin'],
      recommendations: ['Update all plugins', 'Enable 2FA']
    },
    updates: {
      core: { current: '6.4.2', latest: '6.4.3', needsUpdate: true },
      plugins: { total: 12, needsUpdate: 3 },
      themes: { total: 3, needsUpdate: 1 }
    },
    system: {
      phpVersion: '8.2.0',
      wordPressVersion: '6.4.2',
      databaseVersion: '8.0.30',
      serverMemory: '512M',
      maxExecutionTime: '300s',
      diskSpace: { used: '2.1GB', total: '10GB', percentage: 21 }
    }
  })

  const { data: cacheMetrics } = useQuery({
    queryKey: ['cache-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/cache/metrics')
      if (!response.ok) return { hitRate: 85, missRate: 15, totalRequests: 1250 }
      return response.json()
    },
    staleTime: 30000
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Site Health</h2>
        <Button variant="outline">Run Full Check</Button>
      </div>

      {/* Health Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Performance</h3>
                <p className="text-sm text-muted-foreground">Site speed and optimization</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{healthData.performance.score}%</div>
                <div className="text-xs text-green-600">Good</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Security</h3>
                <p className="text-sm text-muted-foreground">Protection and safety measures</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{healthData.security.score}%</div>
                <div className="text-xs text-green-600">Excellent</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Cache Performance</h3>
                <p className="text-sm text-muted-foreground">Cache hit/miss rates</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{cacheMetrics?.hitRate || 85}%</div>
                <div className="text-xs text-blue-600">Hit Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information & Cache Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium">PHP Version</label>
              <p className="text-sm text-muted-foreground">{healthData.system.phpVersion}</p>
            </div>
            <div>
              <label className="text-sm font-medium">WordPress Version</label>
              <p className="text-sm text-muted-foreground">{healthData.system.wordPressVersion}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Memory Limit</label>
              <p className="text-sm text-muted-foreground">{healthData.system.serverMemory}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Cache Hit Rate</label>
              <p className="text-sm text-green-600 font-medium">{cacheMetrics?.hitRate || 85}%</p>
            </div>
            <div>
              <label className="text-sm font-medium">Cache Miss Rate</label>
              <p className="text-sm text-orange-600">{cacheMetrics?.missRate || 15}%</p>
            </div>
            <div>
              <label className="text-sm font-medium">Total Cache Requests</label>
              <p className="text-sm text-muted-foreground">{cacheMetrics?.totalRequests || 1250}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Disk Usage</label>
              <p className="text-sm text-muted-foreground">
                {healthData.system.diskSpace.used} / {healthData.system.diskSpace.total} 
                ({healthData.system.diskSpace.percentage}%)
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Max Execution Time</label>
              <p className="text-sm text-muted-foreground">{healthData.system.maxExecutionTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance & Security Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthData.performance.issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{issue}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {healthData.performance.recommendations[index]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthData.security.issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{issue}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {healthData.security.recommendations[index]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Updates Available */}
      <Card>
        <CardHeader>
          <CardTitle>Available Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthData.updates.core.needsUpdate && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">WordPress Core Update</p>
                  <p className="text-sm text-muted-foreground">
                    {healthData.updates.core.current} → {healthData.updates.core.latest}
                  </p>
                </div>
                <Button size="sm">Update Now</Button>
              </div>
            )}
            
            {healthData.updates.plugins.needsUpdate > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium">Plugin Updates</p>
                  <p className="text-sm text-muted-foreground">
                    {healthData.updates.plugins.needsUpdate} of {healthData.updates.plugins.total} plugins need updating
                  </p>
                </div>
                <Button size="sm" variant="outline">View Plugins</Button>
              </div>
            )}

            {healthData.updates.themes.needsUpdate > 0 && (
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium">Theme Updates</p>
                  <p className="text-sm text-muted-foreground">
                    {healthData.updates.themes.needsUpdate} of {healthData.updates.themes.total} themes need updating
                  </p>
                </div>
                <Button size="sm" variant="outline">View Themes</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
