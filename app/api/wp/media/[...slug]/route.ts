import type { NextRequest } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { slug?: string[]; path?: string[] } }) {
  const segs = (params?.slug ?? params?.path ?? []) as string[]
  if (!Array.isArray(segs) || segs.length === 0) {
    return new Response('Bad path', { status: 400 })
  }
  const WP = (process.env.WP_URL || 'http://example.com').replace(/\/+$/, '')
  let origin = `${WP}/${segs.join('/')}`
  if (segs[0] === 'absolute') {
    const encoded = segs.slice(1).join('/')
    try {
      const full = decodeURIComponent(encoded)
      const u = new URL(full)
      if (u.protocol === 'http:' || u.protocol === 'https:') origin = full
    } catch {}
  }

  const headers: Record<string, string> = {
    Accept: 'image/*,*/*;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Referer: 'http://example.com/',
  }
  let upstream: Response
  try {
    upstream = await fetch(origin, { cache: 'no-store', headers })
  } catch (err: any) {
    return placeholder('upstream-fetch-error')
  }
  if (!upstream.ok) {
    return upstream.status === 404 ? new Response('Not found', { status: 404 }) : placeholder(`upstream-status-${upstream.status}`)
  }
  const ct = upstream.headers.get('content-type')?.toLowerCase() ?? ''
  const ab = await upstream.arrayBuffer()
  if (!ct.startsWith('image/')) {
    return placeholder('bad-content-type', { 'X-Upstream-Content-Type': ct || 'unknown' })
  }
  return new Response(ab, { headers: { 'Content-Type': ct || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' } })
}

function placeholder(reason: string, extra?: Record<string, string>) {
  const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBA6m+Vb8AAAAASUVORK5CYII='
  const body = Buffer.from(b64, 'base64')
  return new Response(body, { status: 200, headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=300', 'X-Proxy-Status': reason, ...(extra || {}) } })
}
