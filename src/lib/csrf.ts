import { cookies } from 'next/headers'

export const CSRF_COOKIE = 'csrf'

export function generateCsrfToken() {
  return cryptoRandom()
}

function cryptoRandom() {
  try {
    return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2,'0')).join('')
  } catch {
    // fallback for environments without crypto.getRandomValues
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
  }
}

// Create secure CSRF cookie with proper security flags
export function createSecureCsrfCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production'
  
  const cookieOptions = [
    `${CSRF_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly=false', // Must be accessible to client-side JavaScript for CSRF header
    isProduction ? 'Secure' : '', // Secure only in production (HTTPS)
    'SameSite=Strict', // Prevent CSRF attacks
    'Max-Age=3600' // 1 hour expiry
  ].filter(Boolean)
  
  return cookieOptions.join('; ')
}

// Create secure session cookie with proper security flags
export function createSecureSessionCookie(token: string, name: string): string {
  const isProduction = process.env.NODE_ENV === 'production'
  
  const cookieOptions = [
    `${name}=${token}`,
    'Path=/',
    'HttpOnly=true', // Prevent XSS attacks
    isProduction ? 'Secure' : '', // Secure only in production (HTTPS)
    'SameSite=Strict', // Prevent CSRF attacks
    'Max-Age=86400' // 24 hours expiry
  ].filter(Boolean)
  
  return cookieOptions.join('; ')
}

export async function validateCsrf(headerToken?: string) {
  const cookieStore = await cookies()
  const cookie = cookieStore.get ? cookieStore.get(CSRF_COOKIE) : null
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

// Middleware to check CSRF tokens on state-changing requests
export function requireCsrfToken() {
  return async (req: Request): Promise<Response | null> => {
    const method = req.method.toUpperCase()
    
    // Only check CSRF for state-changing methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return null // Continue processing
    }
    
    const csrfToken = req.headers.get('x-csrf-token') || 
                      req.headers.get('X-CSRF-Token') ||
                      req.headers.get('csrf-token')
    
    if (!validateCsrfFromRequest(req, csrfToken || undefined)) {
      return new Response(
        JSON.stringify({
          error: 'CSRF Token Invalid',
          message: 'Request must include valid CSRF token'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    }
    
    return null // Continue processing
  }
}
