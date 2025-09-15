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
    return (claims as { wpToken?: string })?.wpToken || null
  } catch {
    return null
  }
}

export async function fetchWithAuth(reqOrToken: Request | string | null | undefined, url: string, init: RequestInit = {}) {
  let wpToken: string | null = null
  if (typeof reqOrToken === 'string') {
    wpToken = reqOrToken
  } else if (reqOrToken && typeof (reqOrToken as { headers?: unknown }).headers === 'object') {
    wpToken = await getWpTokenFromRequest(reqOrToken as Request)
  }
  if (!wpToken) throw new MissingWpTokenError()
  const headers: HeadersInit = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(init.headers as any),
    Authorization: `Bearer ${wpToken}`,
  }
  // Some proxies may read cookie Authorization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(headers as any).Cookie) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  let contentType = res.headers.get('Content-Type') || 'application/json'
  
  // If upstream returned HTML but we expected JSON, try to detect and handle it
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    // WordPress returned an HTML error page instead of JSON
    const errorMessage = `WordPress returned HTML error page instead of JSON response`
    const errorResponse = { error: 'wp_html_response', message: errorMessage, originalStatus: res.status }
    return new Response(JSON.stringify(errorResponse), { 
      status: res.status >= 400 ? res.status : 502, 
      headers: { 'Content-Type': 'application/json' } 
    })
  }
  
  // For non-JSON responses, preserve the original content type
  if (!contentType.includes('application/json') && text.trim().startsWith('{')) {
    contentType = 'application/json'
  }
  
  return new Response(text, { status: res.status, headers: { 'Content-Type': contentType } })
}
