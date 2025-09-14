import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  if (!WP) {
    return new Response(JSON.stringify({ error: 'WP_URL env required' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const { searchParams } = new URL(req.url)
  const range = searchParams.get('range') || '7d'
  
  // Convert range to days
  const rangeDays = range === '1d' ? 1 : 
                   range === '7d' ? 7 : 
                   range === '30d' ? 30 : 
                   range === '90d' ? 90 : 7

  try {
    const incomingCookies = req.headers.get('cookie') || ''
    
    // Fetch data from multiple WordPress endpoints in parallel
    const endpoints = {
      overview: `${WP}/wp-json/fe-analytics/v1/dashboard-overview?days=${rangeDays}`,
      timeline: `${WP}/wp-json/fe-analytics/v1/dashboard-timeline?days=${rangeDays}`,
      realtime: `${WP}/wp-json/fe-analytics/v1/dashboard-realtime`,
    }

    const [overviewRes, timelineRes, realtimeRes] = await Promise.all([
      fetch(endpoints.overview, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(incomingCookies ? { cookie: incomingCookies } : {}),
        },
        cache: 'no-store',
      }),
      fetch(endpoints.timeline, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(incomingCookies ? { cookie: incomingCookies } : {}),
        },
        cache: 'no-store',
      }),
      fetch(endpoints.realtime, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(incomingCookies ? { cookie: incomingCookies } : {}),
        },
        cache: 'no-store',
      }),
    ])

    // Parse responses with fallbacks
    const parseResponse = async <T>(res: Response, fallback: T): Promise<T> => {
      if (!res.ok) {
        console.warn(`Dashboard API ${res.url} failed: ${res.status}`)
        return fallback
      }
      try {
        return await res.json()
      } catch {
        return fallback
      }
    }

    const overview = await parseResponse(overviewRes, {
      totalViews: 0,
      uniqueVisitors: 0,
      pageViews: 0,
      avgSessionDuration: 0,
      bounceRate: 0,
      topCountries: [],
      topDevices: [],
      topPages: [],
    })

    const timeline = await parseResponse(timelineRes, [])
    const realtime = await parseResponse(realtimeRes, {
      activeUsers: 0,
      currentPage: '/',
      recentActions: [],
    })

    const dashboardData: DashboardData = {
      overview,
      timeline,
      realtime,
    }

    return new Response(JSON.stringify(dashboardData), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    
    // Return fallback data to prevent dashboard crashes
    const fallbackData: DashboardData = {
      overview: {
        totalViews: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        avgSessionDuration: 0,
        bounceRate: 0,
        topCountries: [
          { country: 'US', count: 0 },
          { country: 'GB', count: 0 },
          { country: 'DE', count: 0 },
        ],
        topDevices: [
          { device: 'desktop', count: 0 },
          { device: 'mobile', count: 0 },
          { device: 'tablet', count: 0 },
        ],
        topPages: [
          { path: '/', title: 'Homepage', views: 0 },
          { path: '/blog', title: 'Blog', views: 0 },
        ],
      },
      timeline: [],
      realtime: {
        activeUsers: 0,
        currentPage: '/',
        recentActions: [],
      },
    }

    return new Response(JSON.stringify(fallbackData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}