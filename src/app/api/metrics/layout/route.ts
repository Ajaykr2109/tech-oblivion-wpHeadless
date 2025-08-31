export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

type Item = { i: string; x: number; y: number; w: number; h: number }

// In-memory store as a placeholder; replace with DB or KV as needed
const store = new Map<string, Item[]>()

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const section = url.searchParams.get('section') || 'dashboard'
  const items = store.get(section) || []
  return Response.json({ section, items }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { section?: string; items?: Item[] }
  const section = body.section || 'dashboard'
  const items = Array.isArray(body.items) ? body.items : []
  store.set(section, items)
  return Response.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url)
  const section = url.searchParams.get('section') || 'dashboard'
  store.delete(section)
  return Response.json({ ok: true })
}
