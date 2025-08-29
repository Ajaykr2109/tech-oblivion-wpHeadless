import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export async function GET() {
  const settings = await getSettings()
  if (settings.robotsCustom && settings.robotsCustom.trim()) {
    return new NextResponse(settings.robotsCustom, { headers: { 'Content-Type': 'text/plain' } })
  }
  const SITE = settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://example.com'
  const body = `User-agent: *\nAllow: /\nSitemap: ${SITE.replace(/\/$/, '')}/sitemap.xml\n`
  return new NextResponse(body, { headers: { 'Content-Type': 'text/plain' } })
}
