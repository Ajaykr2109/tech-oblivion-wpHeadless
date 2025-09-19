import { apiMap } from '@/lib/wpAPIMap'
import { getWpTokenFromRequest } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const inUrl = new URL(req.url)
  const endpoint = inUrl.searchParams.get('endpoint') || 'summary'
  
  try {
    // Get WordPress token for authentication
    const wpToken = await getWpTokenFromRequest(req)
    
    // Test different endpoints
    const testEndpoints = {
      summary: apiMap.analytics.summary,
      views: apiMap.analytics.views,
      check: apiMap.analytics.check,
      devices: apiMap.analytics.devices,
      countries: apiMap.analytics.countries,
      referers: apiMap.analytics.referers,
    }
    
    const targetUrl = testEndpoints[endpoint as keyof typeof testEndpoints]
    if (!targetUrl) {
      return Response.json({ 
        error: 'Invalid endpoint', 
        availableEndpoints: Object.keys(testEndpoints) 
      }, { status: 400 })
    }
    
    // Make direct fetch without fetchWithAuth to see raw response
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    
    if (wpToken) {
      headers['Authorization'] = `Bearer ${wpToken}`
      headers['Cookie'] = `Authorization=Bearer ${wpToken}`
    }
    
    console.log(`🔍 Testing endpoint: ${targetUrl}`)
    console.log(`🔑 Auth token present: ${!!wpToken}`)
    
    const response = await fetch(targetUrl, { headers })
    const text = await response.text()
    
    console.log(`📊 Response status: ${response.status}`)
    console.log(`📋 Response content-type: ${response.headers.get('content-type')}`)
    console.log(`📄 Response preview: ${text.substring(0, 200)}...`)
    
    let parsedData = null
    let isValidJSON = false
    
    try {
      parsedData = JSON.parse(text)
      isValidJSON = true
    } catch (e) {
      console.log(`❌ JSON parse error: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
    
    return Response.json({
      endpoint: targetUrl,
      status: response.status,
      contentType: response.headers.get('content-type'),
      isValidJSON,
      isHTML: text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html'),
      responsePreview: text.substring(0, 500),
      responseLength: text.length,
      hasAuth: !!wpToken,
      data: isValidJSON ? parsedData : null,
      debugInfo: {
        wpBase: process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL || 'Not configured',
        sessionCookieName: process.env.SESSION_COOKIE_NAME || 'session',
        requestHeaders: Object.fromEntries(
          ['authorization', 'cookie', 'accept', 'content-type']
            .map(h => [h, req.headers.get(h) || 'Not present'])
        )
      }
    })
    
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return Response.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      endpoint: endpoint
    }, { status: 500 })
  }
}