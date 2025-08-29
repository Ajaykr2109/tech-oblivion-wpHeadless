import { cookies } from 'next/headers'

export const CSRF_COOKIE = 'csrf'

export function generateCsrfToken() {
  return cryptoRandom()
}

function cryptoRandom() {
  try {
    return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2,'0')).join('')
  } catch (e) {
    // fallback
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
  }
}

export function validateCsrf(headerToken?: string) {
  const cookieStore = (cookies() as any)
  const cookie = (cookieStore.get ? cookieStore.get(CSRF_COOKIE) : null)
  if (!cookie) return false
  if (!headerToken) return false
  return cookie.value === headerToken
}

export function validateCsrfFromRequest(req: Request, headerToken?: string) {
  try {
    const raw = req.headers.get('cookie') || ''
    if (!raw || !headerToken) return false
    const parts = raw.split(';').map(p => p.trim())
    const match = parts.find(p => p.startsWith(`${CSRF_COOKIE}=`))
    if (!match) return false
    const value = match.substring(CSRF_COOKIE.length + 1)
    return value === headerToken
  } catch {
    return false
  }
}
