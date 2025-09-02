import { NextRequest } from 'next/server'

import { cacheImage } from '@/lib/mediaCache'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return Response.json({ error: 'missing url' }, { status: 400 })
  try {
    const local = await cacheImage(url)
    return Response.json({ url: local })
  } catch (e: unknown) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 502 })
  }
}
