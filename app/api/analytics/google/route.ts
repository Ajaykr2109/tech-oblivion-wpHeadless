import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// This is a placeholder for Google Analytics integration
// In a real implementation, you would use the Google Analytics Reporting API
// with proper authentication and credentials

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const _period = searchParams.get('period') || '7d' // Acknowledged but unused in mock

  // For now, return mock data
  // In production, integrate with Google Analytics API
  const mockData = {
    users: 1250,
    sessions: 1890,
    pageviews: 3420,
    avgSessionDuration: 180, // seconds
    bounceRate: 42.5,
    topPages: [
      { page: '/', views: 890 },
      { page: '/about', views: 340 },
      { page: '/blog', views: 280 },
      { page: '/contact', views: 120 },
    ],
    topCountries: [
      { country: 'United States', users: 450 },
      { country: 'India', users: 320 },
      { country: 'United Kingdom', users: 180 },
      { country: 'Canada', users: 150 },
    ],
    deviceCategory: [
      { category: 'mobile', users: 650 },
      { category: 'desktop', users: 480 },
      { category: 'tablet', users: 120 },
    ]
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))

  return new Response(JSON.stringify(mockData), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300' // 5 minutes cache
    }
  })
}