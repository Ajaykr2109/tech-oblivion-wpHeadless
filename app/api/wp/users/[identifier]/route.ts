export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'
 
import { fetchWithAuth } from '@/lib/fetchWithAuth'

type PublicUser = {
  id: number
  name?: string
  slug: string
  description?: string
  avatar_urls?: Record<string, string>
  profile_fields?: Record<string, unknown> | null
  recent_posts?: Array<{
    id: number;
    title: string;
    slug: string;
    date: string;
    link: string;
    content_raw: string;
    content_rendered: string;
  }>
  recent_comments?: Array<{
    id: number;
    post: number;
    date: string;
    link: string;
    content_raw: string;
    content_rendered: string;
  }>
  social?: { twitter: string | null; linkedin: string | null; github: string | null }
}

function normalizeUrl(u?: string | null): string | null {
  if (!u) return null
  const s = String(u).trim()
  if (!s) return null
  if (/^https?:\/\//i.test(s)) return s
  return `https://${s}`
}

function deriveSocial(u: Record<string, unknown>): { twitter: string | null; linkedin: string | null; github: string | null } {
  // Prefer explicit social object if backend/plugin supplies it
  if (u && typeof u.social === 'object' && u.social) {
    const social = u.social as Record<string, unknown>
    return {
      twitter: normalizeUrl(typeof social.twitter === 'string' ? social.twitter : null),
      linkedin: normalizeUrl(typeof social.linkedin === 'string' ? social.linkedin : null),
      github: normalizeUrl(typeof social.github === 'string' ? social.github : null),
    }
  }
  const pf = (u && typeof u.profile_fields === 'object') ? (u.profile_fields as Record<string, unknown>) : null
  const get = (k: string) => (pf && typeof pf[k] === 'string') ? (pf[k] as string) : undefined
  // Primary keys from user_meta
  const tw = (u?.twitter_url as string) || get('twitter_url') || get('twitter') || get('x')
  const ln = (u?.linkedin_url as string) || get('linkedin_url') || get('linkedin')
  const gh = (u?.github_url as string) || get('github_url') || get('github')
  return { twitter: normalizeUrl(tw || null), linkedin: normalizeUrl(ln || null), github: normalizeUrl(gh || null) }
}

function sanitize(u: Record<string, unknown>): PublicUser {
  const mapPost = (p: Record<string, unknown>) => ({
    id: Number(p?.id ?? 0),
    title: String(p?.title ?? (p?.title as Record<string, unknown>)?.rendered ?? ''),
    slug: String(p?.slug ?? ''),
    date: String(p?.date ?? p?.date_gmt ?? ''),
    link: String(p?.link ?? ''),
    content_raw: String(p?.content_raw ?? (p?.content as Record<string, unknown>)?.raw ?? ''),
    content_rendered: String(p?.content_rendered ?? (p?.content as Record<string, unknown>)?.rendered ?? ''),
  })
  const mapComment = (c: Record<string, unknown>) => ({
    id: Number(c?.id ?? 0),
    post: Number(c?.post ?? c?.post_id ?? 0),
    date: String(c?.date ?? c?.date_gmt ?? ''),
    link: String(c?.link ?? c?.permalink ?? ''),
    content_raw: String(c?.content_raw ?? (c?.content as Record<string, unknown>)?.raw ?? ''),
    content_rendered: String(c?.content_rendered ?? (c?.content as Record<string, unknown>)?.rendered ?? ''),
  })
  return {
    id: Number(u?.id ?? 0),
    name: typeof u?.name === 'string' ? u.name : typeof u?.display_name === 'string' ? u.display_name : undefined,
    slug: String(u?.slug ?? ''),
    description: typeof u?.description === 'string' ? u.description : '',
    avatar_urls: (u?.avatar_urls && typeof u.avatar_urls === 'object') ? u.avatar_urls as Record<string, string> : {},
    profile_fields: (u?.profile_fields && typeof u.profile_fields === 'object') ? u.profile_fields as Record<string, unknown> : null,
    recent_posts: Array.isArray(u?.recent_posts) ? u.recent_posts.map(mapPost) : [],
    recent_comments: Array.isArray(u?.recent_comments) ? u.recent_comments.map(mapComment) : [],
    social: deriveSocial(u),
  }
}

function isNumericId(identifier: string): boolean {
  return /^\d+$/.test(identifier)
}

// GET handler for public user profiles (by slug)
export async function GET(request: Request, context: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await context.params
  
  // Only handle slug-based requests for GET
  if (isNumericId(identifier)) {
    return new Response(JSON.stringify({ error: 'GET requests should use slug, not numeric ID' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  if (!WP) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })

  const base = WP.replace(/\/$/, '')
  const url = new URL(`/wp-json/fe-auth/v1/public-user/${encodeURIComponent(identifier)}`, base)
  // forward optional compact flag
  const inUrl = new URL(request.url)
  const compact = inUrl.searchParams.get('compact')
  if (compact != null) url.searchParams.set('compact', compact)

  const revalidate = Number(process.env.PROFILE_CACHE_SECONDS || '0')
  const fetchOpts: RequestInit = revalidate > 0
    ? { next: { revalidate } }
    : { cache: 'no-store' }

  try {
    const res = await fetch(url.toString(), fetchOpts)
    if (res.status === 404) {
      return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    if (!res.ok) {
      // Mask upstream errors
      return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    const data = await res.json().catch(() => null) as Record<string, unknown> | null
    if (!data || typeof data !== 'object') {
      return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    const out = sanitize(data)
    if (!out.slug) {
      return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch {
    return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } })
  }
}

// PATCH handler for user management (by ID)
export async function PATCH(req: NextRequest, { params }: { params: { identifier: string } }) {
  try {
    const WP = process.env.WP_URL
    if (!WP) return new Response('WP_URL env required', { status: 500 })

    const identifier = params.identifier

    // Only handle numeric ID requests for PATCH
    if (!isNumericId(identifier)) {
      return new Response(JSON.stringify({ error: 'PATCH requests require numeric ID, not slug' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const userId = identifier
    const body = await req.json().catch(() => ({} as Record<string, unknown>))
    const action = String((body as Record<string, unknown>).action || '')

    // Build upstream request(s)
    const base = WP.replace(/\/$/, '')

    // Prefer fe-auth proxy so WP accepts Bearer/session auth and supports array params
    const proxyBase = new URL('/wp-json/fe-auth/v1/proxy', base)
    const path = `wp/v2/users/${encodeURIComponent(userId)}`

    const doProxy = async (payload: unknown) => {
      const u = new URL(proxyBase)
      u.searchParams.set('path', path)
      // WordPress expects JSON body for user updates
      return fetchWithAuth(req, u.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload ?? {}),
      })
    }

    // Supported actions
    if (action === 'change_role') {
      const newRole = String((body as Record<string, unknown>).newRole || '')
      if (!newRole) {
        return new Response(JSON.stringify({ error: 'newRole is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
      }
      return doProxy({ roles: [newRole] })
    }
    if (action === 'edit') {
      // Pass-through editable fields (name, email, description, profile_fields, social)
      const allowed: string[] = ['name', 'first_name', 'last_name', 'email', 'url', 'description', 'profile_fields', 'social']
      const payload: Record<string, unknown> = {}
      for (const k of allowed) {
        if (k in (body as Record<string, unknown>)) payload[k] = (body as Record<string, unknown>)[k]
      }
      return doProxy(payload)
    }
    if (action === 'activate' || action === 'deactivate') {
      // Use custom profile_fields.status as activation flag (MU plugin exposes this field)
      // We do NOT remove roles to avoid locking out accounts; roles remain intact.
      // UI should read status from user.profile_fields.status
      const status = action === 'activate' ? 'active' : 'inactive'
      return doProxy({ profile_fields: { status } })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('User management error:', error)
    return new Response(JSON.stringify({ error: 'Failed to update user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// DELETE handler for user deletion (by ID)
export async function DELETE(req: NextRequest, { params }: { params: { identifier: string } }) {
  try {
    const WP = process.env.WP_URL
    if (!WP) return new Response('WP_URL env required', { status: 500 })

    const identifier = params.identifier

    // Only handle numeric ID requests for DELETE
    if (!isNumericId(identifier)) {
      return new Response(JSON.stringify({ error: 'DELETE requests require numeric ID, not slug' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const base = WP.replace(/\/$/, '')
    const proxy = new URL('/wp-json/fe-auth/v1/proxy', base)
    proxy.searchParams.set('path', `wp/v2/users/${encodeURIComponent(identifier)}`)
    // Forward any reassign param if present (required by WP when deleting users with content)
    const inUrl = new URL(req.url)
    const reassign = inUrl.searchParams.get('reassign')
    if (reassign) proxy.searchParams.set('query[reassign]', reassign)
    proxy.searchParams.set('query[force]', 'true')

    return fetchWithAuth(req, proxy.toString(), { method: 'DELETE' })
  } catch (error) {
    console.error('User deletion error:', error)
    return new Response(JSON.stringify({ error: 'Failed to delete user' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}