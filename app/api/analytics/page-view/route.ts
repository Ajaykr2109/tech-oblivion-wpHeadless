export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface PageTrackingRequest {
  path: string
  title?: string
  referrer?: string
  timestamp?: number
  session_id?: string
  user_agent?: string
  screen_resolution?: string
  timezone?: string
  language?: string
}

export async function POST(req: Request) {
  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  if (!WP) {
    return new Response(JSON.stringify({ success: false, error: 'WP_URL env required' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let body: PageTrackingRequest | null = null
  try {
    body = await req.json() as PageTrackingRequest
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (!body?.path) {
    return new Response(JSON.stringify({ success: false, error: 'path required' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const url = new URL('/wp-json/fe-auth/v1/track-page', WP.replace(/\/$/, ''))
  
  try {
    const incomingCookies = req.headers.get('cookie') || ''
    const userAgent = req.headers.get('user-agent') || body.user_agent || 'techoblivion-next-proxy'
    const forwardedFor = req.headers.get('x-forwarded-for') || ''
    const realIp = req.headers.get('x-real-ip') || ''
    
    // Prepare the tracking data
    const trackingData = {
      path: body.path,
      title: body.title || '',
      referrer: body.referrer || '',
      session_id: body.session_id || '',
      screen_resolution: body.screen_resolution || '',
      timezone: body.timezone || '',
      language: body.language || 'en'
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Forward authentication cookies to WordPress
        ...(incomingCookies ? { cookie: incomingCookies } : {}),
        'User-Agent': userAgent,
        // Forward IP information for accurate geolocation
        ...(forwardedFor ? { 'X-Forwarded-For': forwardedFor } : {}),
        ...(realIp ? { 'X-Real-IP': realIp } : {}),
      },
      cache: 'no-store',
      body: JSON.stringify(trackingData)
    })

    const responseText = await response.text()
    
    if (!response.ok) {
      console.error('WordPress tracking failed:', response.status, responseText)
      return new Response(responseText || JSON.stringify({ success: false, error: 'wp error' }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Parse and validate the response
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { success: true, raw_response: responseText }
    }

    return new Response(JSON.stringify(responseData), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Page tracking upstream error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'upstream error', 
      detail: error instanceof Error ? error.message : String(error)
    }), { 
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}