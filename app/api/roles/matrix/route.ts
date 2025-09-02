import { cookies } from 'next/headers'

import { verifySession } from '@/lib/jwt'
import { normalizeRole } from '@/lib/roles'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  let userRoles: string[] = []
  if (sessionCookie?.value) {
    try {
      const claims = await verifySession(sessionCookie.value) as { roles?: string[] }
      userRoles = Array.isArray(claims?.roles) ? claims.roles : []
    } catch {
      // Ignore session verification errors
    }
  }

  const currentRole = normalizeRole(userRoles)

  // Map to user's requested roles: admin, editor, viewer, guest
  const roleMapping: Record<string, 'admin' | 'editor' | 'viewer' | 'guest'> = {
    admin: 'admin',
    publisher: 'editor',
    editor: 'editor',
    author: 'editor',
    writer: 'viewer',
    reader: 'viewer',
    seo_lead: 'editor',
    seo_specialist: 'viewer',
    guest: 'guest',
  }

  const mappedRole = roleMapping[currentRole] || 'guest'

  const matrix = {
    currentRole: mappedRole,
    userRoles,
    permissions: {
      view: ['admin', 'editor', 'viewer'].includes(mappedRole),
      edit: ['admin', 'editor'].includes(mappedRole),
      delete: ['admin'].includes(mappedRole),
      publish: ['admin', 'editor'].includes(mappedRole),
      draft: ['admin', 'editor', 'viewer'].includes(mappedRole),
      settings: ['admin'].includes(mappedRole),
      moderate: ['admin', 'editor'].includes(mappedRole),
      admin: mappedRole === 'admin',
    },
    // Detailed matrix for UI components
    can: {
      posts: {
        create: ['admin', 'editor'].includes(mappedRole),
        edit: ['admin', 'editor'].includes(mappedRole),
        delete: ['admin'].includes(mappedRole),
        publish: ['admin', 'editor'].includes(mappedRole),
        draft: ['admin', 'editor', 'viewer'].includes(mappedRole),
      },
      comments: {
        view: ['admin', 'editor', 'viewer'].includes(mappedRole),
        moderate: ['admin', 'editor'].includes(mappedRole),
        delete: ['admin'].includes(mappedRole),
      },
      users: {
        view: ['admin', 'editor'].includes(mappedRole),
        edit: ['admin'].includes(mappedRole),
        delete: ['admin'].includes(mappedRole),
      },
      media: {
        upload: ['admin', 'editor'].includes(mappedRole),
        delete: ['admin'].includes(mappedRole),
      },
      categories: {
        manage: ['admin', 'editor'].includes(mappedRole),
      },
      tags: {
        manage: ['admin', 'editor'].includes(mappedRole),
      },
      analytics: {
        view: ['admin', 'editor'].includes(mappedRole),
      },
      settings: {
        view: ['admin'].includes(mappedRole),
        edit: ['admin'].includes(mappedRole),
      },
      plugins: {
        view: ['admin'].includes(mappedRole),
        manage: ['admin'].includes(mappedRole),
      },
      themes: {
        view: ['admin'].includes(mappedRole),
        manage: ['admin'].includes(mappedRole),
      },
    }
  }
  return Response.json(matrix, { headers: { 'Cache-Control': 'no-store' } })
}
