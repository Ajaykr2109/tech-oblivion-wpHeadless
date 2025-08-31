import { apiMap } from '@/lib/wpAPIMap'
import { fetchWithAuth, MissingWpTokenError } from '@/lib/fetchWithAuth'
import { cookies } from 'next/headers'
import { verifySession } from '@/lib/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // Derive wpToken from session cookie (or fall back to request parsing in fetchWithAuth)
    let wpToken: string | null = null
    try {
      const store = await cookies()
      const sessionCookie = store.get(process.env.SESSION_COOKIE_NAME ?? 'session')?.value
      if (sessionCookie) {
        const claims = await verifySession(sessionCookie)
        wpToken = (claims as any)?.wpToken || null
      }
    } catch (e) {
      // ignore cookie/verify errors; fetchWithAuth will throw if no token
    }
    const inUrl = new URL(req.url)
    const period = inUrl.searchParams.get('period') || 'month'
    const refresh = inUrl.searchParams.get('refresh') || ''

    const { analytics } = apiMap
    const endpoints = {
      views: analytics.views,
      devices: analytics.devices,
      countries: analytics.countries,
      referers: analytics.referers,
    }
    if (!endpoints.views) {
      return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    const buildUrl = (base: string) => {
      const u = new URL(base)
      u.searchParams.set('period', period)
      if (refresh) u.searchParams.set('refresh', refresh)
      return u.toString()
    }

    // Fetch concurrently; apply light ISR-style caching
    const tokenOrReq = wpToken || req
    const [viewsRes, devicesRes, countriesRes, referersRes] = await Promise.all([
      fetchWithAuth(tokenOrReq, buildUrl(endpoints.views), { next: { revalidate: 60 } }),
      endpoints.devices ? fetchWithAuth(tokenOrReq, buildUrl(endpoints.devices), { next: { revalidate: 60 } }) : Promise.resolve(new Response('{}', { status: 204 })),
      endpoints.countries ? fetchWithAuth(tokenOrReq, buildUrl(endpoints.countries), { next: { revalidate: 60 } }) : Promise.resolve(new Response('{}', { status: 204 })),
      endpoints.referers ? fetchWithAuth(tokenOrReq, buildUrl(endpoints.referers), { next: { revalidate: 60 } }) : Promise.resolve(new Response('{}', { status: 204 })),
    ])

    const parseJSON = async (r: Response) => {
      if (!r || r.status === 204) return null
      const t = await r.text()
      try { return t ? JSON.parse(t) : null } catch { return { raw: t } }
    }

    const [views, devices, countries, referers] = await Promise.all([
      parseJSON(viewsRes),
      parseJSON(devicesRes),
      parseJSON(countriesRes),
      parseJSON(referersRes),
    ])

    const status = Math.max(viewsRes.status, devicesRes.status, countriesRes.status, referersRes.status)
    const body = { summary: { views, devices, countries, referers } }
    if (status === 401 || status === 403) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: 'Not authorized to view analytics' }), { status, headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify(body), { status: status >= 400 ? 502 : 200, headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    if (err instanceof MissingWpTokenError) {
      return new Response(JSON.stringify({ error: 'unauthorized', message: err.message }), { status: err.status, headers: { 'Content-Type': 'application/json' } })
    }
    const message = typeof err?.message === 'string' ? err.message : 'Failed to fetch analytics summary'
    console.error('analytics.summary unexpected error:', err)
    return new Response(JSON.stringify({ error: 'proxy_error', message }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }
}
