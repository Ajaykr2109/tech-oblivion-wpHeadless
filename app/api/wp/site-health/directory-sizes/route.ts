import { apiMap } from '@/lib/wpAPIMap'
import { fetchWithAuth } from '@/lib/fetchWithAuth'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  return fetchWithAuth(req, apiMap.siteHealth.directorySizes)
}
