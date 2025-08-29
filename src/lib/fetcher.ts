export type APIError = { status: number; message: string; details?: unknown }

// Don't throw at module load time; some build steps import this file when
// environment variables may not be present. Validate WP_URL at runtime in
// `wpFetch` so build-time data collection doesn't crash.
const WP_URL = process.env.WP_URL ?? ''

export async function apiFetch<T = unknown>(path: string, opts?: { method?: string; body?: unknown; headers?: Record<string,string>; credentials?: RequestCredentials }) : Promise<T> {
  const url = path.startsWith('http') ? path : `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}${path}`
  const res = await fetch(url, {
    method: opts?.method ?? 'GET',
    headers: {
      'content-type': opts?.body ? 'application/json' : 'application/json',
      ...(opts?.headers ?? {}),
    },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
    credentials: opts?.credentials ?? 'same-origin',
  })

  const contentType = res.headers.get('content-type') ?? ''
  let payload: unknown = undefined
  if (contentType.includes('application/json')) payload = await res.json()
  else payload = await res.text()

  if (!res.ok) {
    const msg = (payload && typeof payload === 'object' && 'message' in (payload as any)) ? (payload as any).message : res.statusText
    const err: APIError = { status: res.status, message: msg, details: payload }
    throw err
  }

  return payload as T
}

export const wpFetch = async <T = unknown>(wpPath: string, opts?: { method?: string; body?: unknown; cookie?: string }) => {
  if (!WP_URL) throw new Error('WP_URL env required')
  const url = wpPath.startsWith('http') ? wpPath : `${WP_URL.replace(/\/$/, '')}/${wpPath.replace(/^\//, '')}`
  const headers: Record<string,string> = { 'content-type': 'application/json' }
  if (opts?.cookie) headers['cookie'] = opts.cookie
  const res = await fetch(url, {
    method: opts?.method ?? 'GET',
    headers,
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  })
  const ct = res.headers.get('content-type') ?? ''
  const data = ct.includes('application/json') ? await res.json() : await res.text()
  if (!res.ok) {
    throw { status: res.status, message: (data && (data as any).message) ? (data as any).message : res.statusText, details: data } as APIError
  }
  return data as T
}
