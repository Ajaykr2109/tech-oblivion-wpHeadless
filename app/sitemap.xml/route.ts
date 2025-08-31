import { NextRequest, NextResponse } from 'next/server'

import { getSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL ?? 'http://example.com'
  const settings = await getSettings()
  const SITE = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://example.com'
  if (!WP) return new NextResponse('WP_URL missing', { status: 500 })

  const url = new URL('/wp-json/wp/v2/posts', WP)
  url.searchParams.set('per_page', '100')
  url.searchParams.set('_fields', 'slug,modified')

  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' }, next: { revalidate: 3600, tags: ['sitemap'] } })
  if (!res.ok) return new NextResponse('Upstream error', { status: 502 })
  const posts = (await res.json()) as Array<{ slug: string; modified?: string }>

  const items = posts
    .map(p => `<url><loc>${SITE.replace(/\/$/, '')}/blog/${p.slug}</loc>${p.modified ? `<lastmod>${new Date(p.modified).toISOString()}</lastmod>` : ''}</url>`)  
    .join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`
  return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } })
}
