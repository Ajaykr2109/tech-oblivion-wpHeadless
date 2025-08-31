import { verifySession } from '@/lib/jwt'

export class MissingWpTokenError extends Error {
  status = 401 as const
  constructor(message = 'Missing wpToken in session') {
    super(message)
    this.name = 'MissingWpTokenError'
  }
}

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

export async function fetchWithAuth(reqOrToken: Request | string | null | undefined, url: string, init: RequestInit = {}) {
  let wpToken: string | null = null
  if (typeof reqOrToken === 'string') {
    wpToken = reqOrToken
  } else if (reqOrToken && typeof (reqOrToken as any).headers === 'object') {
    wpToken = await getWpTokenFromRequest(reqOrToken as Request)
  }
  if (!wpToken) throw new MissingWpTokenError()
  const headers: HeadersInit = {
    ...(init.headers as any),
    Authorization: `Bearer ${wpToken}`,
  }
  // Some proxies may read cookie Authorization
  if (!(headers as any).Cookie) {
    (headers as any).Cookie = `Authorization=Bearer ${wpToken}`
  }
  // Honor caller-provided caching options. Default to no-store only if not provided.
  const finalInit: RequestInit & { next?: { revalidate?: number | false } } = { ...init, headers }
  if (finalInit.cache === undefined && finalInit.next === undefined) {
    finalInit.cache = 'no-store'
  }
  const res = await fetch(url, finalInit)
  // If upstream denies auth, return a structured JSON error instead of raw HTML/text
  if (res.status === 401 || res.status === 403) {
    let message = res.statusText || 'Unauthorized'
    try {
      const t = await res.text()
      const j = t ? JSON.parse(t) : null
      message = (j?.message as string) || message
    } catch {
      // ignore parse errors
    }
    return new Response(JSON.stringify({ error: 'unauthorized', message }), { status: res.status, headers: { 'Content-Type': 'application/json' } })
  }
  const text = await res.text()
  return new Response(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
}
