import { verifySession } from '@/lib/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const WP = process.env.WP_URL
  if (!WP) return new Response(JSON.stringify({ error: 'config', message: 'WP_URL env required' }), { status: 500 })

  // Extract session token from cookie header (align with /api/auth/me)
  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`${process.env.SESSION_COOKIE_NAME || 'session'}=([^;]+)`))
  const token = match?.[1]
  if (!token) return new Response(JSON.stringify({ error: 'unauthorized', message: 'Missing session cookie' }), { status: 401, headers: { 'Content-Type': 'application/json' } })

  let claims: { wpToken?: string }
  try { claims = await verifySession(token) as { wpToken?: string } } catch {
    return new Response(JSON.stringify({ error: 'unauthorized', message: 'Invalid session token' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }
  const wpToken = claims?.wpToken
  if (!wpToken) return new Response(JSON.stringify({ error: 'unauthorized', message: 'Missing wpToken in session' }), { status: 401, headers: { 'Content-Type': 'application/json' } })

  // Include profile_fields exposed by FE Auth Bridge plugin (and meta for backward compat)
  const fields = 'id,slug,name,email,roles,avatar_urls,description,url,locale,nickname,profile_fields,meta'
  // Try MU plugin proxy first
  const proxyUrl = new URL('/wp-json/fe-auth/v1/proxy', WP)
  proxyUrl.searchParams.set('path', 'wp/v2/users/me')
  proxyUrl.searchParams.set('context', 'edit')
  proxyUrl.searchParams.set('_fields', fields)
  let res = await fetch(proxyUrl, {
    headers: {
      Authorization: `Bearer ${wpToken}`,
      // Some proxies read cookies; pass token also as cookie for compatibility
      Cookie: `Authorization=Bearer ${wpToken}`,
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    // Fallback to direct WP REST
    const url = new URL('/wp-json/wp/v2/users/me', WP)
    url.searchParams.set('context', 'edit')
    url.searchParams.set('_fields', fields)
    res = await fetch(url, { headers: { Authorization: `Bearer ${wpToken}` }, cache: 'no-store' })
  }
  const text = await res.text()
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}

export async function POST(req: Request) {
  const WP = process.env.WP_URL
  if (!WP) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })

  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`${process.env.SESSION_COOKIE_NAME || 'session'}=([^;]+)`))
  const token = match?.[1]
  if (!token) return new Response(JSON.stringify({ error: 'Unauthorized', message: 'Missing session cookie' }), { status: 401 })

  let claims: { wpToken?: string }
  try { claims = await verifySession(token) } catch { return new Response(JSON.stringify({ error: 'Unauthorized', message: 'Invalid session token' }), { status: 401 }) }
  const wpToken = claims?.wpToken
  if (!wpToken) return new Response(JSON.stringify({ error: 'Unauthorized', message: 'Missing wpToken in session' }), { status: 401 })

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { body = {} }

  // Only allow a safe subset to pass through
  // Allow profile_fields to pass through to WP (plugin will handle persistence). Keep meta for backward compat.
  const allowed = ['name','nickname','email','url','description','locale','profile_fields','meta']
  const patch: Record<string, unknown> = {}
  for (const k of allowed) if (k in body) patch[k] = body[k]

  // Try MU plugin proxy first
  const proxyUrl = new URL('/wp-json/fe-auth/v1/proxy', WP)
  proxyUrl.searchParams.set('path', 'wp/v2/users/me')
  let res = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${wpToken}`,
      'Content-Type': 'application/json',
      Cookie: `Authorization=Bearer ${wpToken}`,
    },
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    const url = new URL('/wp-json/wp/v2/users/me', WP)
    res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${wpToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patch),
    })
  }

  const text = await res.text()
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}

export async function PUT(req: Request) {
  // Mirror POST but with PUT method; forward meta too
  const WP = process.env.WP_URL
  if (!WP) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })

  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`${process.env.SESSION_COOKIE_NAME || 'session'}=([^;]+)`))
  const token = match?.[1]
  if (!token) return new Response(JSON.stringify({ error: 'Unauthorized', message: 'Missing session cookie' }), { status: 401 })

  let claims: { wpToken?: string }
  try { claims = await verifySession(token) } catch { return new Response(JSON.stringify({ error: 'Unauthorized', message: 'Invalid session token' }), { status: 401 }) }
  const wpToken = claims?.wpToken
  if (!wpToken) return new Response(JSON.stringify({ error: 'Unauthorized', message: 'Missing wpToken in session' }), { status: 401 })

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { body = {} }
  const allowed = ['name','nickname','email','url','description','locale','profile_fields','meta']
  const patch: Record<string, unknown> = {}
  for (const k of allowed) if (k in body) patch[k] = body[k]

  // Try MU plugin proxy first
  const proxyUrl = new URL('/wp-json/fe-auth/v1/proxy', WP)
  proxyUrl.searchParams.set('path', 'wp/v2/users/me')
  let res = await fetch(proxyUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${wpToken}`,
      'Content-Type': 'application/json',
      Cookie: `Authorization=Bearer ${wpToken}`,
    },
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    const url = new URL('/wp-json/wp/v2/users/me', WP)
    res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${wpToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patch),
    })
  }

  const text = await res.text()
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}
