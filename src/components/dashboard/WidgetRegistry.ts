export type Widget = {
  id: string
  title: string
  section: 'Dashboard' | 'Analytics' | 'Posts' | 'Media' | 'Users' | 'Settings' | 'Plugins' | 'Themes' | 'Site Health' | 'Debug/Test'
  type: 'tile' | 'chart' | 'crud' | 'table' | 'api_tester' | 'editor'
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  chartType?: 'line' | 'bar' | 'pie' | 'gauge'
  realtime?: boolean
  refreshInterval?: number
  role?: 'user' | 'editor' | 'admin'
  pinned?: boolean
  schema?: any
  href?: string
  defaultLayout: { i: string; x: number; y: number; w: number; h: number }
}

export const widgetRegistry: Widget[] = [
  // Dashboard section
  { id: 'sessions_count', title: '⭐ Sessions', section: 'Dashboard', type: 'tile', endpoint: '/api/analytics/sessions/summary', defaultLayout: { i: 'sessions_count', x: 0, y: 0, w: 3, h: 3 } },
  { id: 'avg_duration', title: '⏱ Avg Duration', section: 'Dashboard', type: 'tile', endpoint: '/api/analytics/sessions/summary', defaultLayout: { i: 'avg_duration', x: 3, y: 0, w: 3, h: 3 } },
  { id: 'sessions_trend', title: '📈 Sessions Trend', section: 'Dashboard', type: 'chart', chartType: 'line', endpoint: '/api/analytics/sessions/timeseries', defaultLayout: { i: 'sessions_trend', x: 6, y: 0, w: 6, h: 5 } },
  { id: 'api_health', title: '⚡ API Health', section: 'Dashboard', type: 'tile', endpoint: '/api/analytics/check', defaultLayout: { i: 'api_health', x: 0, y: 3, w: 3, h: 3 } },

  // Analytics
  { id: 'views_trend', title: 'Views Trend', section: 'Analytics', type: 'chart', chartType: 'line', endpoint: '/api/analytics/views', defaultLayout: { i: 'views_trend', x: 0, y: 0, w: 6, h: 5 } },
  { id: 'devices_usage', title: 'Devices', section: 'Analytics', type: 'chart', chartType: 'pie', endpoint: '/api/analytics/devices', defaultLayout: { i: 'devices_usage', x: 6, y: 0, w: 3, h: 4 } },
  { id: 'referers_dist', title: 'Referrers', section: 'Analytics', type: 'chart', chartType: 'pie', endpoint: '/api/analytics/referers', defaultLayout: { i: 'referers_dist', x: 9, y: 0, w: 3, h: 4 } },
  { id: 'top_posts', title: 'Top Posts', section: 'Analytics', type: 'table', endpoint: '/api/analytics/top-posts', defaultLayout: { i: 'top_posts', x: 0, y: 5, w: 6, h: 5 } },

  // Posts
  { id: 'total_posts', title: 'Total Posts', section: 'Posts', type: 'tile', endpoint: '/api/wp/posts/count', defaultLayout: { i: 'total_posts', x: 0, y: 0, w: 3, h: 3 } },
  { id: 'drafts_count', title: 'Drafts', section: 'Posts', type: 'tile', endpoint: '/api/wp/posts/count?status=draft', defaultLayout: { i: 'drafts_count', x: 3, y: 0, w: 3, h: 3 } },
  { id: 'pending_count', title: 'Pending Review', section: 'Posts', type: 'tile', endpoint: '/api/wp/posts/count?status=pending', defaultLayout: { i: 'pending_count', x: 6, y: 0, w: 3, h: 3 } },
  { id: 'recent_posts', title: 'Recent Posts', section: 'Posts', type: 'table', endpoint: '/api/wp/posts?perPage=5', href: '/editor', defaultLayout: { i: 'recent_posts', x: 0, y: 3, w: 6, h: 5 } },
  { id: 'post_editor', title: '✍️ New Post', section: 'Posts', type: 'editor', endpoint: '/api/wp/posts', method: 'POST', role: 'editor', defaultLayout: { i: 'post_editor', x: 6, y: 3, w: 6, h: 6 } },

  // Media
  { id: 'total_media', title: 'Total Media', section: 'Media', type: 'tile', endpoint: '/api/wp/media/count', defaultLayout: { i: 'total_media', x: 0, y: 0, w: 3, h: 3 } },
  { id: 'recent_media', title: 'Recent Uploads', section: 'Media', type: 'table', endpoint: '/api/wp/media?per_page=6', defaultLayout: { i: 'recent_media', x: 3, y: 0, w: 6, h: 4 } },

  // Users
  { id: 'total_users', title: 'Total Users', section: 'Users', type: 'tile', endpoint: '/api/wp/users/count', defaultLayout: { i: 'total_users', x: 0, y: 0, w: 3, h: 3 } },
  { id: 'presence', title: 'Real-time Presence', section: 'Users', type: 'tile', endpoint: '/api/analytics/stream', realtime: true, defaultLayout: { i: 'presence', x: 3, y: 0, w: 3, h: 4 } },

  // Debug
  { id: 'crewman', title: 'CrewMan API Tester', section: 'Debug/Test', type: 'api_tester', endpoint: '/api/core/endpoints', role: 'admin', defaultLayout: { i: 'crewman', x: 0, y: 0, w: 12, h: 6 } },
]
