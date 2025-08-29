import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/jwt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })
  const incoming = new URL(req.url);
  const out = new URL('/wp-json/wp/v2/posts', WP);

  // pass through supported params
  incoming.searchParams.forEach((v, k) => out.searchParams.set(k, v));

  // normalize camelCase -> WP expected names
  if (incoming.searchParams.has('perPage')) {
    out.searchParams.set('per_page', incoming.searchParams.get('perPage')!);
  }
  // keep ?page as-is (WP REST uses `page` for pagination)
  // ensure useful defaults
  if (!out.searchParams.has('_embed')) out.searchParams.set('_embed', '1');
  if (!out.searchParams.has('per_page')) out.searchParams.set('per_page', '10');

  const res = await fetch(out, { cache: 'no-store' });
  if (!res.ok) return new Response('Upstream error', { status: res.status });

  return Response.json(await res.json(), {
    headers: { 'Cache-Control': 'public, max-age=60' },
  });
}

// Create a post (requires at least 'author' role)
export async function POST(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  if (!sessionCookie?.value) return new Response('Unauthorized', { status: 401 })
  let claims: any
  try { claims = await verifySession(sessionCookie.value) } catch { return new Response('Unauthorized', { status: 401 }) }
  const roles: string[] = (claims.roles as any) || []
  if (!roles.some(r => ['author','editor','administrator'].includes(r))) {
    return new Response('Forbidden', { status: 403 })
  }
  const wpToken = (claims as any).wpToken
  if (!wpToken) return new Response('Missing upstream token', { status: 401 })

  // Parse body; if tags are names, resolve to IDs
  const raw = await req.text()
  let bodyJson: any
  try { bodyJson = raw ? JSON.parse(raw) : {} } catch { bodyJson = {} }
  if (Array.isArray(bodyJson?.tags) && bodyJson.tags.length && typeof bodyJson.tags[0] === 'string') {
    try {
      const names: string[] = bodyJson.tags
      const resolveRes = await fetch(new URL('/api/wp/tags/resolve', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ names }), cache: 'no-store'
      } as any)
      if (resolveRes.ok) {
        const j = await resolveRes.json()
        bodyJson.tags = Array.isArray(j?.ids) ? j.ids : []
      }
    } catch {}
  }
  const res = await fetch(new URL('/wp-json/wp/v2/posts', WP), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${wpToken}` },
    body: JSON.stringify(bodyJson),
  })
  const text = await res.text()
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}

// Update a post (requires capability: own post for authors; any for editor/admin)
export async function PATCH(req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })
  const incoming = new URL(req.url)
  const id = incoming.searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  if (!sessionCookie?.value) return new Response('Unauthorized', { status: 401 })
  let claims: any
  try { claims = await verifySession(sessionCookie.value) } catch { return new Response('Unauthorized', { status: 401 }) }
  const roles: string[] = (claims.roles as any) || []
  if (!roles.some(r => ['author','editor','administrator'].includes(r))) {
    return new Response('Forbidden', { status: 403 })
  }
  const wpToken = (claims as any).wpToken
  if (!wpToken) return new Response('Missing upstream token', { status: 401 })

  // Optional: ownership check for authors by fetching the post first
  if (roles.includes('author') && !roles.some(r => ['editor','administrator'].includes(r))) {
    const postRes = await fetch(new URL(`/wp-json/wp/v2/posts/${id}`, WP), { headers: { Authorization: `Bearer ${wpToken}` } })
    if (postRes.ok) {
      const post = await postRes.json()
      if (post?.author && String(post.author) !== String(claims.wpUserId)) {
        return new Response('Forbidden', { status: 403 })
      }
    }
  }

  const raw = await req.text()
  let bodyJson: any
  try { bodyJson = raw ? JSON.parse(raw) : {} } catch { bodyJson = {} }
  if (Array.isArray(bodyJson?.tags) && bodyJson.tags.length && typeof bodyJson.tags[0] === 'string') {
    try {
      const names: string[] = bodyJson.tags
      const resolveRes = await fetch(new URL('/api/wp/tags/resolve', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ names }), cache: 'no-store'
      } as any)
      if (resolveRes.ok) {
        const j = await resolveRes.json()
        bodyJson.tags = Array.isArray(j?.ids) ? j.ids : []
      }
    } catch {}
  }
  const res = await fetch(new URL(`/wp-json/wp/v2/posts/${id}`, WP), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${wpToken}` },
    body: JSON.stringify(bodyJson),
  })
  const text = await res.text()
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}
