import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const WP = (process.env.WP_URL || '').replace(/\/$/, '')

export async function GET(req: Request) {
  if (!WP) return Response.json([], { status: 200 })
  // Generic discovery: list all WP REST routes; restrict to fe-* namespaces
  const res = await fetchWithAuth(req, `${WP}/wp-json`)
  try {
    const j: unknown = await res.json()
    const data = j as { routes?: Record<string, { methods?: string[] }> }
    const out: { method: string; route: string }[] = []
    if (data && typeof data === 'object' && data.routes && typeof data.routes === 'object') {
      for (const [route, meta] of Object.entries(data.routes)) {
        const methods: string[] = (meta && typeof meta === 'object' && 'methods' in meta && Array.isArray(meta.methods)) ? meta.methods : []
        methods.forEach(m => out.push({ method: m, route: `/api${route}`.replace(/^\/+/, '/') }))
      }
    }
    return Response.json(out)
  } catch {
    return Response.json([], { status: 200 })
  }
}
