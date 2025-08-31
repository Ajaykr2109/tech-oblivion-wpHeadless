import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

import { verifySession } from '@/lib/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Minimal roles matrix focused on editing capabilities
// This can be extended or wired to WP capabilities if needed
export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  let roles: string[] = []
  if (sessionCookie?.value) {
    try {
      const claims: any = await verifySession(sessionCookie.value)
      roles = (claims?.roles as any) || []
    } catch {}
  }
  const matrix = {
    roles,
    can: {
      posts: {
        create: roles.some(r => ['author','editor','administrator'].includes(r)),
        edit: roles.some(r => ['author','editor','administrator'].includes(r)),
        delete: roles.some(r => ['editor','administrator'].includes(r)),
        publish: roles.some(r => ['editor','administrator'].includes(r)),
        requestPublish: roles.some(r => ['author','editor','administrator'].includes(r)),
      }
    }
  }
  return Response.json(matrix, { headers: { 'Cache-Control': 'no-store' } })
}
