import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

import { verifySession } from '@/lib/jwt'

export const runtime = 'nodejs'

export async function GET(_request: NextRequest) {
  const WP_BASE = process.env.WP_URL
  if (!WP_BASE) {
    return new Response('WP_URL env required', { status: 500 })
  }

  try {
    // Fetch comment settings from WordPress backend
    const settingsUrl = new URL('/wp-json/fe-auth/v1/comment-settings', WP_BASE)
    const response = await fetch(settingsUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`)
    }

    const settings = await response.json()
    
    return new Response(JSON.stringify(settings), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Comments settings API error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch comment settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function PATCH(request: NextRequest) {
  const WP_BASE = process.env.WP_URL
  if (!WP_BASE) {
    return new Response('WP_URL env required', { status: 500 })
  }

  // Require authenticated session with admin privileges
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  if (!sessionCookie?.value) return new Response('Unauthorized', { status: 401 })

  let claims: { wpToken?: string; roles?: string[] }
  try { 
    claims = await verifySession(sessionCookie.value) as { wpToken?: string; roles?: string[] } 
  } catch { 
    return new Response('Unauthorized', { status: 401 }) 
  }
  
  const wpToken = claims.wpToken
  const roles = claims.roles || []
  
  if (!wpToken) return new Response('Missing upstream token', { status: 401 })
  if (!roles.some(r => ['administrator', 'editor'].includes(r))) {
    return new Response('Insufficient privileges', { status: 403 })
  }

  try {
    const body = await request.json()
    const { autoApprove } = body

    // Update comment settings via WordPress backend
    const settingsUrl = new URL('/wp-json/fe-auth/v1/comment-settings', WP_BASE)
    const updateResponse = await fetch(settingsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${wpToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ autoApprove }),
    })

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text().catch(() => '')
      return new Response(JSON.stringify({ 
        error: 'Update failed', 
        detail: errorText.slice(0, 1000) 
      }), { 
        status: updateResponse.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await updateResponse.json()
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Comments settings update error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to update comment settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}