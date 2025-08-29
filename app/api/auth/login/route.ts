// cookies import removed (unused)
import { z } from 'zod'
import { signSession } from '../../../../src/lib/jwt'
import { logWPError } from '../../../../src/lib/log'

const schema = z.object({ identifier: z.string().min(1), password: z.string().min(1) })

export async function POST(req: Request) {
  const body = await req.json()
  const { identifier, password } = schema.parse(body)
  let data: any
  
  try {
    // Direct fetch to WordPress JWT endpoint
    const wpUrl = process.env.WP_URL || 'https://techoblivion.in'
    const response = await fetch(`${wpUrl}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: identifier, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      logWPError('jwt-auth-failed', { 
        status: response.status, 
        statusText: response.statusText,
        body: JSON.stringify(errorData)
      })
      
      if (response.status === 403) {
        return new Response(JSON.stringify({ 
          error: 'Invalid credentials', 
          message: 'Username or password is incorrect' 
        }), { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        })
      }
      
      return new Response(JSON.stringify({ 
        error: 'WordPress authentication failed', 
        details: errorData 
      }), { 
        status: response.status, 
        headers: { 'Content-Type': 'application/json' } 
      })
    }

    data = await response.json()
    
  } catch (err: any) {
    console.error('WordPress connection error:', err)
    logWPError('wordpress-connection-error', { 
      statusText: err.message,
      body: err.stack || ''
    })
    
    return new Response(JSON.stringify({ 
      error: 'Unable to reach WordPress backend', 
      details: err.message 
    }), { 
      status: 502, 
      headers: { 'Content-Type': 'application/json' } 
    })
  }

  // JWT auth endpoint returns token and user info
  const { token, user_email, user_nicename, user_display_name } = data as { 
    token: string; 
    user_email: string; 
    user_nicename: string; 
    user_display_name: string;
    user_id?: number;
  }

  // Create session with the user data from JWT response
  const sessionToken = await signSession({ 
    sub: String(data.user_id || user_nicename), 
    username: user_nicename, 
    email: user_email, 
    roles: ['subscriber'] // Default role, can be enhanced later
  })

  const isProd = process.env.NODE_ENV === 'production'
  const cookie = `${process.env.SESSION_COOKIE_NAME || 'session'}=${sessionToken}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax; ${isProd ? 'Secure; ' : ''}HttpOnly`
  
  return new Response(JSON.stringify({ 
    user: {
      id: data.user_id || user_nicename,
      username: user_nicename,
      email: user_email,
      displayName: user_display_name
    },
    token 
  }), { status: 200, headers: { 'Set-Cookie': cookie, 'Content-Type': 'application/json' } })
}
