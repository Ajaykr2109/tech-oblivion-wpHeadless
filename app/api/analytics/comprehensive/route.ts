import { cookies } from 'next/headers'

import { fetchWithAuth } from '@/lib/fetchWithAuth'
import { verifySession } from '@/lib/jwt'
import { apiMap } from '@/lib/wpAPIMap'

// Type definitions for API responses
interface ViewsItem {
  date: string
  views: number
  post_id?: number
}

interface CountryItem {
  country?: string
  country_code?: string
  count: number
}

interface DeviceItem {
  device_type?: string
  device?: string
  count: number
}

interface RefererItem {
  source?: string
  referer?: string
  medium?: string
  count: number
}

interface ViewsResponse {
  series?: ViewsItem[]
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // Get authentication token
    let wpToken: string | null = null
    try {
      const store = await cookies()
      const sessionCookie = store.get(process.env.SESSION_COOKIE_NAME ?? 'session')?.value
      if (sessionCookie) {
        const claims = await verifySession(sessionCookie) as { wpToken?: string }
        wpToken = claims?.wpToken || null
      }
    } catch {
      // ignore cookie/verify errors
    }

    const url = new URL(req.url)
    const period = url.searchParams.get('period') || '7d'
    
    const { analytics } = apiMap
    if (!analytics.views) {
      return new Response(JSON.stringify({ error: 'WP_URL env required' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      })
    }

    // Fetch data from all available endpoints
    const tokenOrReq = wpToken || req
    const [viewsRes, devicesRes, countriesRes, referersRes] = await Promise.all([
      fetchWithAuth(tokenOrReq, `${analytics.views}?period=${period}`, { next: { revalidate: 60 } }),
      analytics.devices ? fetchWithAuth(tokenOrReq, `${analytics.devices}?period=${period}`, { next: { revalidate: 60 } }) : null,
      analytics.countries ? fetchWithAuth(tokenOrReq, `${analytics.countries}?period=${period}`, { next: { revalidate: 60 } }) : null,
      analytics.referers ? fetchWithAuth(tokenOrReq, `${analytics.referers}?period=${period}`, { next: { revalidate: 60 } }) : null,
    ])

    const parseJSON = async (r: Response | null) => {
      if (!r || r.status === 204) return null
      const text = await r.text()
      try { return text ? JSON.parse(text) : null } catch { return { raw: text } }
    }

    const [views, devices, countries, referers] = await Promise.all([
      parseJSON(viewsRes),
      parseJSON(devicesRes),
      parseJSON(countriesRes),
      parseJSON(referersRes),
    ])

    // Transform and enhance the data to match our comprehensive interface
    const totalViews = (views as ViewsResponse)?.series?.reduce((sum: number, item: ViewsItem) => sum + (item.views || 0), 0) || 0
    const uniqueVisitors = Math.floor(totalViews * 0.7) // Estimate unique visitors as 70% of total views
    const totalSessions = Math.floor(totalViews * 0.8) // Estimate sessions
    const avgSessionDuration = 240 // 4 minutes average
    const bounceRate = 35.2
    const conversionRate = 2.1
    const returnVisitorRate = 42.3
    const avgPageLoadTime = 1.8
    const exitRate = 28.5

    // Generate time series data
    const timeSeries = (views as ViewsResponse)?.series?.map((item: ViewsItem) => ({
      date: item.date,
      views: item.views || 0,
      visitors: Math.floor((item.views || 0) * 0.7),
      sessions: Math.floor((item.views || 0) * 0.8),
      bounceRate: 35 + Math.random() * 10, // Simulated
      avgDuration: 200 + Math.random() * 80, // Simulated
    })) || []

    // Process countries data
    const processedCountries = (countries as CountryItem[] || []).map((country: CountryItem, index: number) => ({
      country: country.country || country.country_code || `Country ${index + 1}`,
      code: country.country_code || 'XX',
      count: country.count || 0,
      percentage: (country.count || 0) / Math.max(totalViews, 1) * 100,
    }))

    // Process devices data
    const processedDevices = (devices as DeviceItem[] || []).map((device: DeviceItem, index: number) => ({
      device: device.device_type || device.device || `Device ${index + 1}`,
      count: device.count || 0,
      percentage: (device.count || 0) / Math.max(totalViews, 1) * 100,
    }))

    // Generate mock page performance data
    const pages = [
      { path: '/', title: 'Homepage', views: Math.floor(totalViews * 0.3), uniqueViews: Math.floor(totalViews * 0.25), avgTimeOnPage: 180, bounceRate: 45, exitRate: 25, entrances: Math.floor(totalViews * 0.4), conversions: 12 },
      { path: '/blog', title: 'Blog', views: Math.floor(totalViews * 0.2), uniqueViews: Math.floor(totalViews * 0.18), avgTimeOnPage: 320, bounceRate: 25, exitRate: 15, entrances: Math.floor(totalViews * 0.25), conversions: 8 },
      { path: '/about', title: 'About', views: Math.floor(totalViews * 0.15), uniqueViews: Math.floor(totalViews * 0.12), avgTimeOnPage: 210, bounceRate: 40, exitRate: 30, entrances: Math.floor(totalViews * 0.18), conversions: 3 },
      { path: '/contact', title: 'Contact', views: Math.floor(totalViews * 0.1), uniqueViews: Math.floor(totalViews * 0.08), avgTimeOnPage: 150, bounceRate: 55, exitRate: 45, entrances: Math.floor(totalViews * 0.12), conversions: 15 },
      { path: '/services', title: 'Services', views: Math.floor(totalViews * 0.08), uniqueViews: Math.floor(totalViews * 0.06), avgTimeOnPage: 280, bounceRate: 30, exitRate: 20, entrances: Math.floor(totalViews * 0.09), conversions: 5 },
    ]

    // Generate mock audience insights
    const audience = {
      countries: processedCountries.slice(0, 10),
      devices: processedDevices.slice(0, 5),
      browsers: [
        { browser: 'Chrome', version: '119.0', count: Math.floor(totalViews * 0.65), percentage: 65 },
        { browser: 'Safari', version: '17.1', count: Math.floor(totalViews * 0.20), percentage: 20 },
        { browser: 'Firefox', version: '119.0', count: Math.floor(totalViews * 0.10), percentage: 10 },
        { browser: 'Edge', version: '119.0', count: Math.floor(totalViews * 0.05), percentage: 5 },
      ],
      operatingSystems: [
        { os: 'Windows', count: Math.floor(totalViews * 0.45), percentage: 45 },
        { os: 'macOS', count: Math.floor(totalViews * 0.25), percentage: 25 },
        { os: 'Android', count: Math.floor(totalViews * 0.20), percentage: 20 },
        { os: 'iOS', count: Math.floor(totalViews * 0.10), percentage: 10 },
      ],
      screenResolutions: [
        { resolution: '1920x1080', count: Math.floor(totalViews * 0.35), percentage: 35 },
        { resolution: '1366x768', count: Math.floor(totalViews * 0.25), percentage: 25 },
        { resolution: '1536x864', count: Math.floor(totalViews * 0.15), percentage: 15 },
        { resolution: '1440x900', count: Math.floor(totalViews * 0.10), percentage: 10 },
        { resolution: '1280x720', count: Math.floor(totalViews * 0.15), percentage: 15 },
      ],
      languages: [
        { language: 'en-US', count: Math.floor(totalViews * 0.60), percentage: 60 },
        { language: 'en-GB', count: Math.floor(totalViews * 0.15), percentage: 15 },
        { language: 'es-ES', count: Math.floor(totalViews * 0.10), percentage: 10 },
        { language: 'fr-FR', count: Math.floor(totalViews * 0.08), percentage: 8 },
        { language: 'de-DE', count: Math.floor(totalViews * 0.07), percentage: 7 },
      ]
    }

    // Traffic sources
    const traffic = {
      referrers: (referers as RefererItem[] || []).map((ref: RefererItem) => ({
        source: ref.source || ref.referer || 'Unknown',
        medium: ref.medium || 'referral',
        count: ref.count || 0,
        percentage: (ref.count || 0) / Math.max(totalSessions, 1) * 100,
      })),
      socialMedia: [
        { platform: 'Facebook', count: Math.floor(totalSessions * 0.12), percentage: 12 },
        { platform: 'Twitter', count: Math.floor(totalSessions * 0.08), percentage: 8 },
        { platform: 'LinkedIn', count: Math.floor(totalSessions * 0.05), percentage: 5 },
        { platform: 'Instagram', count: Math.floor(totalSessions * 0.03), percentage: 3 },
      ],
      searchEngines: [
        { engine: 'Google', count: Math.floor(totalSessions * 0.45), percentage: 45 },
        { engine: 'Bing', count: Math.floor(totalSessions * 0.08), percentage: 8 },
        { engine: 'DuckDuckGo', count: Math.floor(totalSessions * 0.02), percentage: 2 },
      ],
      directTraffic: Math.floor(totalSessions * 0.35),
      emailTraffic: Math.floor(totalSessions * 0.05),
    }

    // Real-time data (mock)
    const realTime = {
      activeUsers: Math.floor(Math.random() * 50) + 10,
      currentSessions: [],
      recentActivity: [
        { type: 'pageview' as const, path: '/', timestamp: new Date().toISOString(), country: 'US', device: 'desktop' },
        { type: 'pageview' as const, path: '/blog', timestamp: new Date(Date.now() - 30000).toISOString(), country: 'UK', device: 'mobile' },
        { type: 'session_start' as const, path: '/about', timestamp: new Date(Date.now() - 60000).toISOString(), country: 'CA', device: 'tablet' },
      ],
      topActivePages: [
        { path: '/', activeUsers: 15 },
        { path: '/blog', activeUsers: 8 },
        { path: '/about', activeUsers: 5 },
      ]
    }

    // User behavior (mock)
    const behavior = {
      userFlow: [
        { fromPage: '/', toPage: '/blog', count: Math.floor(totalViews * 0.3), dropOffRate: 15 },
        { fromPage: '/blog', toPage: '/about', count: Math.floor(totalViews * 0.2), dropOffRate: 25 },
        { fromPage: '/about', toPage: '/contact', count: Math.floor(totalViews * 0.1), dropOffRate: 35 },
      ],
      scrollDepth: [
        { page: '/', avgScrollDepth: 75, completion25: 95, completion50: 80, completion75: 65, completion100: 35 },
        { page: '/blog', avgScrollDepth: 85, completion25: 98, completion50: 90, completion75: 75, completion100: 45 },
        { page: '/about', avgScrollDepth: 70, completion25: 92, completion50: 75, completion75: 60, completion100: 30 },
      ],
      sessionPatterns: [
        { sessionLength: '0-30s', count: Math.floor(totalSessions * 0.2), percentage: 20 },
        { sessionLength: '31s-1m', count: Math.floor(totalSessions * 0.15), percentage: 15 },
        { sessionLength: '1-3m', count: Math.floor(totalSessions * 0.25), percentage: 25 },
        { sessionLength: '3-10m', count: Math.floor(totalSessions * 0.30), percentage: 30 },
        { sessionLength: '10m+', count: Math.floor(totalSessions * 0.10), percentage: 10 },
      ]
    }

    // Performance metrics (mock)
    const performance = {
      loadTimes: [
        { page: '/', avgLoadTime: 1.2, medianLoadTime: 1.0, p95LoadTime: 2.8 },
        { page: '/blog', avgLoadTime: 1.8, medianLoadTime: 1.5, p95LoadTime: 3.2 },
        { page: '/about', avgLoadTime: 1.1, medianLoadTime: 0.9, p95LoadTime: 2.1 },
      ],
      coreWebVitals: {
        lcp: 2.1, // Largest Contentful Paint
        fid: 50,  // First Input Delay (ms)
        cls: 0.05, // Cumulative Layout Shift
        fcp: 1.2,  // First Contentful Paint
      },
      devicePerformance: [
        { deviceType: 'desktop', avgLoadTime: 1.3, errorRate: 0.5 },
        { deviceType: 'mobile', avgLoadTime: 2.1, errorRate: 1.2 },
        { deviceType: 'tablet', avgLoadTime: 1.7, errorRate: 0.8 },
      ]
    }

    // Combine all data
    const comprehensiveData = {
      overview: {
        totalViews,
        uniqueVisitors,
        pageViews: totalViews,
        avgSessionDuration,
        bounceRate,
        conversionRate,
        totalSessions,
        returnVisitorRate,
        avgPageLoadTime,
        exitRate,
      },
      timeSeries,
      pages,
      audience,
      traffic,
      realTime,
      behavior,
      performance,
    }

    return new Response(JSON.stringify(comprehensiveData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Comprehensive analytics error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'failed_to_fetch', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}