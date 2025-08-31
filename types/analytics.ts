export type Period = 'day' | 'week' | 'month' | 'quarter' | 'year'

export type AnalyticsCheck = {
  tables: {
    post_views_daily: { exists: boolean; rows: number }
    post_view_meta: { exists: boolean; rows: number }
  }
}

export type ViewsPoint = { date: string; views: number; post_id?: number }
export type ViewsSeries = { series: ViewsPoint[] }

export type TopPost = { id: number; slug: string; title: string; views: number }

export type DeviceBreakdown = { device_type: 'mobile' | 'tablet' | 'desktop' | 'other'; count: number }

export type CountryBreakdown = { country_code: string; count: number }

export type RefererBreakdown = { source: string; count: number; category?: 'social' | 'search' | 'direct' | 'other' }

// Optional types for sessions endpoint
export type SessionsPoint = { date: string; sessions: number }
export type SessionsSeries = { data: SessionsPoint[] }
