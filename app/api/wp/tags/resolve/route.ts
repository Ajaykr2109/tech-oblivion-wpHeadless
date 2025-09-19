import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

import { verifySession } from '@/lib/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Claims = {
  roles?: string[]
  wpToken?: string
}

export async function POST(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })
  const cookieStore = await cookies()
  const token = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')?.value
  if (!token) return new Response('Unauthorized', { status: 401 })
  let claims: Claims
  try { claims = await verifySession(token) as Claims } catch { return new Response('Unauthorized', { status: 401 }) }
  const roles: string[] = claims.roles || []
  if (!roles.some(r => ['contributor','author','editor','administrator'].includes(r))) {
    return new Response('Forbidden', { status: 403 })
  }
  const wpToken = claims.wpToken
  if (!wpToken) return new Response('Missing upstream token', { status: 401 })

  const body = await req.json()
  const names: string[] = body.names || []
  if (!Array.isArray(names)) {
    return new Response('Invalid request: names array required', { status: 400 })
  }

  const tagIds: number[] = []
  
  for (const name of names) {
    if (!name?.trim()) continue
    
    // First, try to find existing tag
    const searchUrl = new URL('/wp-json/wp/v2/tags', WP)
    searchUrl.searchParams.set('search', name.trim())
    searchUrl.searchParams.set('per_page', '1')
    
    const searchRes = await fetch(searchUrl.toString(), {
      headers: { Authorization: `Bearer ${wpToken}` }
    })
    
    if (searchRes.ok) {
      const existingTags = await searchRes.json()
      if (Array.isArray(existingTags) && existingTags.length > 0) {
        const exactMatch = existingTags.find((tag: { id: number; name: string }) => 
          tag.name?.toLowerCase() === name.trim().toLowerCase()
        )
        if (exactMatch) {
          tagIds.push(exactMatch.id)
          continue
        }
      }
    }
    
    // If tag doesn't exist, create it
    const createRes = await fetch(new URL('/wp-json/wp/v2/tags', WP), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${wpToken}` 
      },
      body: JSON.stringify({ name: name.trim() })
    })
    
    if (createRes.ok) {
      const newTag = await createRes.json()
      tagIds.push(newTag.id)
    }
  }
  
  return Response.json({ ids: tagIds })
}