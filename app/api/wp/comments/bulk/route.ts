import { fetchWithAuth } from '@/lib/fetchWithAuth'
import { apiMap } from '@/lib/wpAPIMap'
import { requireAccess } from '@/lib/requireAccess'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  await requireAccess({ path: '/api/wp/comments/[id]', method: 'PATCH', action: 'moderate' })
  // Proxy to MU endpoint defined in apiMap.comments.bulk
  return fetchWithAuth(req, apiMap.comments.bulk, { method: 'POST', body: await req.text(), headers: { 'Content-Type': 'application/json' } })
}
