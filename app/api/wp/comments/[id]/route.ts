export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'
 
import { fetchWithAuth } from '@/lib/fetchWithAuth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const WP = process.env.WP_URL
    if (!WP) return new Response('WP_URL env required', { status: 500 })

    const commentId = params.id
    const body = await req.json()
    const { action } = body

    const actionMap = {
      approve: 'approved',
      unapprove: 'hold',
      spam: 'spam',
      unspam: 'approved',
      trash: 'trash',
      restore: 'approved',
    } as const

    const status = actionMap[action as keyof typeof actionMap]
    if (!status) {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const base = WP.replace(/\/$/, '')
    const proxy = new URL('/wp-json/fe-auth/v1/proxy', base)
    proxy.searchParams.set('path', `wp/v2/comments/${encodeURIComponent(commentId)}`)
    // WP supports updating comment status via POST/PATCH with {status}
    return fetchWithAuth(req, proxy.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  } catch (error) {
    console.error('Comment moderation error:', error)
    return new Response(JSON.stringify({ error: 'Failed to moderate comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const WP = process.env.WP_URL
    if (!WP) return new Response('WP_URL env required', { status: 500 })

    const commentId = params.id

    const base = WP.replace(/\/$/, '')
    const proxy = new URL('/wp-json/fe-auth/v1/proxy', base)
    proxy.searchParams.set('path', `wp/v2/comments/${encodeURIComponent(commentId)}`)
    return fetchWithAuth(req, proxy.toString(), { method: 'DELETE' })
  } catch (error) {
    console.error('Comment deletion error:', error)
    return new Response(JSON.stringify({ error: 'Failed to delete comment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}