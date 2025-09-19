export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Mock cache metrics data - in a real implementation this would come from your cache system
    const mockMetrics = {
      hitRate: Math.floor(Math.random() * 15) + 80, // 80-95%
      missRate: Math.floor(Math.random() * 15) + 5, // 5-20%
      totalRequests: Math.floor(Math.random() * 1000) + 1000, // 1000-2000
      efficiency: 'Good',
      lastUpdated: new Date().toISOString()
    }

    // Ensure hit rate + miss rate = 100%
    mockMetrics.missRate = 100 - mockMetrics.hitRate
    
    // Determine efficiency based on hit rate
    if (mockMetrics.hitRate >= 90) {
      mockMetrics.efficiency = 'Excellent'
    } else if (mockMetrics.hitRate >= 80) {
      mockMetrics.efficiency = 'Good'
    } else if (mockMetrics.hitRate >= 70) {
      mockMetrics.efficiency = 'Fair'
    } else {
      mockMetrics.efficiency = 'Poor'
    }

    return new Response(JSON.stringify(mockMetrics), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Cache metrics error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch cache metrics' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}