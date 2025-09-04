import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { verifySession } from './src/lib/jwt'
import { getMinimumEditorRole } from './src/lib/permissions'

const PROTECTED_ROUTES = ['/dashboard', '/account', '/admin']
const EDITOR_ROUTES = ['/editor']

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon') ||
      pathname.includes('.')) {
    return NextResponse.next()
  }
  
  // Check if route requires protection
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  const isEditor = EDITOR_ROUTES.some(route => pathname.startsWith(route))
  
  if (!isProtected && !isEditor) {
    return NextResponse.next()
  }
  
  // Get session token
  const sessionCookie = process.env.SESSION_COOKIE_NAME ?? 'session'
  const token = req.cookies.get(sessionCookie)?.value
  
  if (!token) {
    // No session - redirect to login
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
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
        return NextResponse.redirect(url)
      }
    }
    
    // Session is valid, continue
    return NextResponse.next()
    
  } catch (error) {
    console.error('Middleware session verification failed:', error)
    
    // Invalid session - redirect to login
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
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
