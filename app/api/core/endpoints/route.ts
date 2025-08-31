import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
const WP = (process.env.WP_URL || '').replace(/\/$/, '')

export async function GET(req: Request) {
  if (!WP) return Response.json([], { status: 200 })
  // Generic discovery: list all WP REST routes; restrict to fe-* namespaces
  const res = await fetchWithAuth(req, `${WP}/wp-json`)
  try {
    const j = await res.json() as any
    const out: { method: string; route: string }[] = []
    if (j && j.routes) {
      for (const [route, meta] of Object.entries(j.routes as any)) {
        const item = meta as any
        const methods: string[] = item?.methods || []
        methods.forEach(m => out.push({ method: m, route: `/api${route}`.replace(/^\/+/, '/') }))
      }
    }
    return Response.json(out)
  } catch {
    return Response.json([], { status: 200 })
  }
}
