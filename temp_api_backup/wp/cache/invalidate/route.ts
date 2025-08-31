import fs from 'fs/promises'
import path from 'path'

import { NextResponse } from 'next/server'

const CACHE_DIR = path.join(process.cwd(), '.cache', 'wp-media')
const INVALIDATE_SECRET = process.env.WP_CACHE_INVALIDATE_SECRET || ''

export async function POST(req: Request) {
  if (!INVALIDATE_SECRET) return NextResponse.json({ error: 'not configured' }, { status: 403 })
  const auth = req.headers.get('x-invalidate-secret') || ''
  if (auth !== INVALIDATE_SECRET) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({})) as { key?: string }
  try {
    if (body.key) {
      // delete specific key
      const file = path.join(CACHE_DIR, body.key)
      await fs.unlink(file).catch(() => null)
      await fs.unlink(`${file}.meta.json`).catch(() => null)
      return NextResponse.json({ ok: true, key: body.key })
    }
    // delete all cache
    await fs.rm(CACHE_DIR, { recursive: true, force: true }).catch(() => null)
    return NextResponse.json({ ok: true, cleared: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
