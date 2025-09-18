import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

import { verifySession } from '@/lib/jwt'

export const runtime = 'nodejs'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const WP_BASE = process.env.WP_URL
  if (!WP_BASE) {
    return new Response('WP_URL env required', { status: 500 })
  }

  const { id } = await params
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing media ID' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Require authenticated session
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  if (!sessionCookie?.value) return new Response('Unauthorized', { status: 401 })

  let claims: { wpToken?: string }
  try { 
    claims = await verifySession(sessionCookie.value) as { wpToken?: string } 
  } catch { 
    return new Response('Unauthorized', { status: 401 }) 
  }
  
  const wpToken = claims.wpToken
  if (!wpToken) return new Response('Missing upstream token', { status: 401 })

  try {
    // Delete from WordPress Media Library
    const deleteUrl = new URL(`/wp-json/wp/v2/media/${id}`, WP_BASE)
    deleteUrl.searchParams.set('force', 'true') // Permanently delete

    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${wpToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text().catch(() => '')
      return new Response(JSON.stringify({ 
        error: 'Delete failed', 
        detail: errorText.slice(0, 1000) 
      }), { 
        status: deleteResponse.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await deleteResponse.json()
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Media delete error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to delete media',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}