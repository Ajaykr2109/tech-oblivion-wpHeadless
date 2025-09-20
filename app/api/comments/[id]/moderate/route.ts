export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const WP = process.env.WP_URL
  const user = process.env.WP_USER || process.env.WP_API_USER
  const pass = process.env.WP_APP_PASSWORD || process.env.WP_API_APP_PASSWORD
  if (!WP) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  if (!user || !pass) return new Response(JSON.stringify({ error: 'Basic auth not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

  let body: unknown
  try { body = await req.json() } catch { body = {} }
  const status = typeof (body as Record<string, unknown>)?.status === 'string' ? String((body as Record<string, unknown>).status) : ''
  
  // Map frontend actions to WordPress status values
  const statusMap: Record<string, string> = {
    'approve': 'approve',
    'hold': 'hold', 
    'spam': 'spam',
    'trash': 'trash',
    'unspam': 'approve' // Map "Not Spam" action to approve status
  }
  
  const wpStatus = statusMap[status]
  if (!wpStatus) {
    return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  const { id } = await context.params
  const url = new URL(`/wp-json/wp/v2/comments/${encodeURIComponent(id)}`, WP)
  const token = Buffer.from(`${user}:${pass}`).toString('base64')
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${token}` },
    body: JSON.stringify({ status: wpStatus }),
    cache: 'no-store',
  })

  const text = await res.text().catch(() => '')
  const contentType = res.headers.get('Content-Type') || 'application/json'
  if (!res.ok) {
    return new Response(text || JSON.stringify({ error: 'Upstream error' }), { status: res.status, headers: { 'Content-Type': contentType } })
  }
  return new Response(text, { status: 200, headers: { 'Content-Type': contentType } })
}
