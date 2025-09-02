import { fetchWithAuth } from '@/lib/fetchWithAuth'
import { apiMap } from '@/lib/wpAPIMap'
import { requireAccess } from '@/lib/requireAccess'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  await requireAccess({ path: '/api/wp/users/[id]', method: 'DELETE', action: 'delete' })
  // Expect body: { ids: number[] }
  const body = await req.text() as string
  // No WP bulk endpoint by default; this is placeholder returning 501 unless MU endpoint exists.
  const target = apiMap.users.bulkDelete
  if (!target) return new Response(JSON.stringify({ error: 'Not implemented' }), { status: 501 })
  return fetchWithAuth(req, target, { method: 'POST', body, headers: { 'Content-Type': 'application/json' } })
}
