export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })

  const incoming = new URL(req.url)
  
  // Debug info
  const debugInfo = {
    timestamp: new Date().toISOString(),
    WP_USER: JSON.stringify(process.env.WP_USER),
    WP_USER_split: process.env.WP_USER?.split(' '),
    WP_APP_PASSWORD_length: process.env.WP_APP_PASSWORD?.length || 0,
    WP_USER_exists: !!process.env.WP_USER,
    WP_APP_PASSWORD_exists: !!process.env.WP_APP_PASSWORD,
    FE_PROXY_SECRET_exists: !!process.env.FE_PROXY_SECRET,
    request_params: Object.fromEntries(incoming.searchParams.entries())
  }

  // Test direct WordPress call
  const basicUser = process.env.WP_USER
  const basicPass = process.env.WP_APP_PASSWORD
  let wpDirectResult: Record<string, unknown> | null = null
  
  if (basicUser && basicPass) {
    try {
      const token = Buffer.from(`${basicUser}:${basicPass}`).toString('base64')
      const wpUrl = new URL('/wp-json/wp/v2/comments', WP)
      // Copy all query params except our debug ones
      incoming.searchParams.forEach((value, key) => {
        if (key !== 'debug') {
          wpUrl.searchParams.set(key, value)
        }
      })
      
      const wpResponse = await fetch(wpUrl.toString(), {
        headers: { Authorization: `Basic ${token}` },
        cache: 'no-store'
      })
      
      wpDirectResult = {
        status: wpResponse.status,
        headers: Object.fromEntries(wpResponse.headers.entries()),
        url: wpUrl.toString()
      }
      
      if (wpResponse.ok) {
        const data = await wpResponse.json()
        wpDirectResult.data = {
          count: Array.isArray(data) ? data.length : 'not-array',
          sample: Array.isArray(data) ? data.slice(0, 2).map(c => ({
            id: c.id,
            status: c.status,
            author_name: c.author_name,
            post: c.post
          })) : 'not-array'
        }
      } else {
        wpDirectResult.error = await wpResponse.text()
      }
    } catch (e) {
      wpDirectResult = { error: e instanceof Error ? e.message : 'Unknown error' }
    }
  }

  return Response.json({
    debug: debugInfo,
    wordpress_direct: wpDirectResult
  }, { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}