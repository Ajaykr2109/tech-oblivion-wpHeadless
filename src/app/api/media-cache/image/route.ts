import { NextRequest } from 'next/server'
import { cacheImage } from '@/lib/mediaCache'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')
  if (!url) return new Response('missing url', { status: 400 })
  try {
    const local = await cacheImage(url)
    // Redirect to the static file under /public/media-cache
    return new Response(null, {
      status: 302,
      headers: {
        Location: local,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e: any) {
    return new Response('bad upstream', { status: 502 })
  }
}
