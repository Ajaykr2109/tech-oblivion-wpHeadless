import { verifySession } from '@/lib/jwt'

export async function getWpTokenFromRequest(req: Request): Promise<string | null> {
  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader.match(new RegExp(`${process.env.SESSION_COOKIE_NAME || 'session'}=([^;]+)`))
  const token = match?.[1]
  if (!token) return null
  try {
    const claims = await verifySession(token)
    return (claims as any)?.wpToken || null
  } catch {
    return null
  }
}

export async function fetchWithAuth(req: Request, url: string, init: RequestInit = {}) {
  const wpToken = await getWpTokenFromRequest(req)
  if (!wpToken) {
    return new Response(JSON.stringify({ error: 'unauthorized', message: 'Missing wpToken in session' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }
  const headers: HeadersInit = {
    ...(init.headers as any),
    Authorization: `Bearer ${wpToken}`,
  }
  // Some proxies may read cookie Authorization
  if (!(headers as any).Cookie) {
    (headers as any).Cookie = `Authorization=Bearer ${wpToken}`
  }
  const res = await fetch(url, { ...init, headers, cache: 'no-store' })
  const text = await res.text()
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}
