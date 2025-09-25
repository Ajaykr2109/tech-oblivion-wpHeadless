import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { verifySession } from './src/lib/jwt'
import { getMinimumEditorRole } from './src/lib/permissions'

const PROTECTED_ROUTES = ['/dashboard', '/account', '/admin']
const EDITOR_ROUTES = ['/editor']

// Production-ready Content Security Policy
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'", 
    'cdn.jsdelivr.net',
    'www.googletagmanager.com',
    'www.google-analytics.com',
    'apis.google.com',
    // Remove unsafe-inline and unsafe-eval for production
    // "'nonce-{NONCE}'" // Use nonces instead of unsafe-inline
  ],
  'style-src': [
    "'self'",
    'fonts.googleapis.com',
    'cdn.jsdelivr.net',
    // "'nonce-{NONCE}'" // Use nonces instead of unsafe-inline
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:',
    'techoblivion.in',
    '*.techoblivion.in'
  ],
  'font-src': [
    "'self'",
    'fonts.gstatic.com',
    'fonts.googleapis.com',
    'data:'
  ],
  'connect-src': [
    "'self'",
    'https:',
    'wss:',
    'techoblivion.in',
    '*.techoblivion.in',
    'api.pwnedpasswords.com' // For password breach checking
  ],
  'frame-src': [
    "'self'",
    'www.youtube.com',
    'youtube.com',
    'player.vimeo.com'
  ],
  'media-src': [
    "'self'",
    'https:',
    'blob:',
    'data:'
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"], // Prevent clickjacking
  'upgrade-insecure-requests': []
}

function buildCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      if (sources.length === 0) return directive
      return `${directive} ${sources.join(' ')}`
    })
    .join('; ')
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set('Content-Security-Policy', buildCSP())
  
  // Other security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Download-Options', 'noopen')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  
  // HSTS (HTTP Strict Transport Security) - only in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }
  
  return response
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon') ||
      pathname.includes('.')) {
    return NextResponse.next()
  }
  
  // Handle dynamic profile redirect: /profile → /author/[my-slug]
  if (pathname === '/profile') {
    const sessionCookie = process.env.SESSION_COOKIE_NAME ?? 'session'
    const token = req.cookies.get(sessionCookie)?.value
    
    if (!token) {
      // Not logged in - redirect to login
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('next', '/profile')
      const response = NextResponse.redirect(loginUrl)
      return addSecurityHeaders(response)
    }
    
    try {
      const claims = await verifySession(token) as {
        slug?: string
        username?: string
        user_nicename?: string
        [key: string]: unknown
      }
      
      // Try multiple possible slug fields from JWT
      const userSlug = claims.slug || claims.username || claims.user_nicename
      if (userSlug) {
        // Redirect to user's author page
        const response = NextResponse.redirect(new URL(`/author/${userSlug}`, req.url))
        return addSecurityHeaders(response)
      } else {
        // No user slug found - redirect to login
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('error', 'no_profile_slug')
        const response = NextResponse.redirect(loginUrl)
        return addSecurityHeaders(response)
      }
    } catch (error) {
      console.error('Profile redirect failed:', error)
      // Invalid session - redirect to login
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('next', '/profile')
      const response = NextResponse.redirect(loginUrl)
      return addSecurityHeaders(response)
    }
  }
  
  // Check if route requires protection
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  const isEditor = EDITOR_ROUTES.some(route => pathname.startsWith(route))
  
  if (!isProtected && !isEditor) {
    const response = NextResponse.next()
    return addSecurityHeaders(response)
  }
  
  // Get session token
  const sessionCookie = process.env.SESSION_COOKIE_NAME ?? 'session'
  const token = req.cookies.get(sessionCookie)?.value
  
  if (!token) {
    // No session - redirect to login
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    const response = NextResponse.redirect(loginUrl)
    return addSecurityHeaders(response)
  }
  
  try {
    // Verify session
    const claims = await verifySession(token) as {
      roles?: string[]
      [key: string]: unknown
    }
    
    const userRoles = claims.roles || []
    
    // For editor routes, check minimum role requirement
    if (isEditor) {
      const minRoles = getMinimumEditorRole()
      const hasAccess = minRoles.some(role => userRoles.includes(role))
      
      if (!hasAccess) {
        // User is logged in but lacks permissions - show 403
        const url = new URL('/403', req.url)
        url.searchParams.set('reason', 'insufficient_permissions')
        const response = NextResponse.redirect(url)
        return addSecurityHeaders(response)
      }
    }
    
    // Session is valid, continue with security headers
    const response = NextResponse.next()
    return addSecurityHeaders(response)
    
  } catch (error) {
    console.error('Middleware session verification failed:', error)
    
    // Invalid session - redirect to login
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    const response = NextResponse.redirect(loginUrl)
    return addSecurityHeaders(response)
  }
}

export const config = {
  matcher: [
    // Include all protected routes but exclude API and static files
    '/dashboard/:path*',
    '/account/:path*',
    '/admin/:path*',
    '/editor/:path*'
  ]
}
