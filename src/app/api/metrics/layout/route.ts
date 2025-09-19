export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

type Item = { i: string; x: number; y: number; w: number; h: number }

// TODO: Replace with proper database/KV storage in production
// For now, using in-memory store for development
const store = new Map<string, Item[]>()

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const section = url.searchParams.get('section') || 'dashboard'
  
  // In production, this would query a database or KV store
  // Example: const items = await db.collection('layout_metrics').find({ section })
  const items = store.get(section) || []
  
  return Response.json({ section, items }, { 
    headers: { 
      'Cache-Control': 'private, max-age=300, stale-while-revalidate=600' 
    } 
  })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { section?: string; items?: Item[] }
  const section = body.section || 'dashboard'
  const items = Array.isArray(body.items) ? body.items : []
  
  // In production, this would save to a database or KV store
  // Example: await db.collection('layout_metrics').updateOne({ section }, { items }, { upsert: true })
  store.set(section, items)
  
  return Response.json({ ok: true, section, itemCount: items.length })
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const section = url.searchParams.get('section') || 'dashboard'
  
  // In production, this would delete from a database or KV store
  // Example: await db.collection('layout_metrics').deleteOne({ section })
  store.delete(section)
  
  return Response.json({ ok: true, section })
}
