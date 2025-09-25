import { NextRequest } from 'next/server'

import { createRateLimitMiddleware, rateLimitConfigs } from '@/lib/rate-limiter'
import { requireCsrfToken } from '@/lib/csrf'
import { verifySession } from '@/lib/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Example secure API route with multiple security layers
export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting (stricter for auth endpoints)
    const rateLimitCheck = createRateLimitMiddleware(rateLimitConfigs.auth)
    const rateLimitResponse = await rateLimitCheck(req)
    if (rateLimitResponse) {
      return rateLimitResponse // Return 429 if rate limit exceeded
    }

    // 2. CSRF protection for state-changing requests
    const csrfCheck = requireCsrfToken()
    const csrfResponse = await csrfCheck(req)
    if (csrfResponse) {
      return csrfResponse // Return 403 if CSRF token invalid
    }

    // 3. Authentication check
    const sessionCookie = req.cookies.get(process.env.SESSION_COOKIE_NAME ?? 'session')
    if (!sessionCookie?.value) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 4. Session verification
    let claims: { roles?: string[]; [key: string]: unknown }
    try {
      claims = await verifySession(sessionCookie.value) as { roles?: string[]; [key: string]: unknown }
    } catch (error) {
      console.error('Session verification failed:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid session' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 5. Authorization check (example: require admin role)
    const userRoles = claims.roles || []
    if (!userRoles.includes('administrator')) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // 6. Input validation (example)
    let requestBody: unknown
    try {
      requestBody = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Example business logic here...
    console.log('Secure operation performed by user:', claims)
    console.log('Request body received:', requestBody)

    // 7. Secure response with proper headers
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Operation completed successfully',
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY'
        }
      }
    )

  } catch (error) {
    console.error('API error:', error)
    
    // Don't leak sensitive error information
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        requestId: crypto.randomUUID() // For tracking in logs
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}