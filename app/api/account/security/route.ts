export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

import { getSessionUser } from '@/lib/auth'

interface SecuritySettings {
  two_factor_enabled: boolean
  login_notifications: boolean
  session_timeout: number
  password_last_changed: string
  active_sessions: Array<{
    id: string
    device: string
    ip_address: string
    last_activity: string
    current: boolean
  }>
  recent_logins: Array<{
    timestamp: string
    ip_address: string
    device: string
    location: string
    success: boolean
  }>
}

export async function GET(_request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // For now, return mock security settings
    // In a real implementation, these would be fetched from a database
    const securitySettings: SecuritySettings = {
      two_factor_enabled: false,
      login_notifications: true,
      session_timeout: 24, // hours
      password_last_changed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      active_sessions: [
        {
          id: 'current-session',
          device: 'Chrome on Windows',
          ip_address: '192.168.1.1',
          last_activity: new Date().toISOString(),
          current: true
        }
      ],
      recent_logins: [
        {
          timestamp: new Date().toISOString(),
          ip_address: '192.168.1.1',
          device: 'Chrome on Windows',
          location: 'Unknown',
          success: true
        }
      ]
    }

    return new Response(JSON.stringify(securitySettings), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=300'
      }
    })

  } catch (error) {
    console.error('Security settings API error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch security settings',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'enable_2fa':
        // In a real implementation, handle 2FA setup
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Two-factor authentication enabled',
            qr_code: 'mock-qr-code-url'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )

      case 'disable_2fa':
        // In a real implementation, handle 2FA disable
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Two-factor authentication disabled'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )

      case 'update_settings':
        // In a real implementation, update security settings
        console.log('Updating security settings for user:', user.id, data)
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Security settings updated successfully'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )

      case 'terminate_session': {
        // In a real implementation, terminate the specified session
        const sessionId = data.session_id
        console.log('Terminating session:', sessionId, 'for user:', user.id)
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Session terminated successfully'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Security settings update error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to update security settings',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}