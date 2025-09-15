export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

import { getSessionUser } from '@/lib/auth'

interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  email_notifications: boolean
  marketing_emails: boolean
  weekly_digest: boolean
  comment_notifications: boolean
  mention_notifications: boolean
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

    // For now, return default preferences
    // In a real implementation, these would be stored in a database
    const preferences: UserPreferences = {
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      email_notifications: true,
      marketing_emails: false,
      weekly_digest: true,
      comment_notifications: true,
      mention_notifications: true,
    }

    return new Response(JSON.stringify(preferences), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=300'
      }
    })

  } catch (error) {
    console.error('Preferences API error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch preferences',
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
    
    // Validate the preferences
    const validPreferences = [
      'theme', 'language', 'timezone', 'email_notifications', 
      'marketing_emails', 'weekly_digest', 'comment_notifications', 'mention_notifications'
    ]
    
    const preferences: Partial<UserPreferences> = {}
    for (const key of validPreferences) {
      if (key in body) {
        preferences[key as keyof UserPreferences] = body[key]
      }
    }

    // In a real implementation, save to database
    console.log('Saving preferences for user:', user.id, preferences)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Preferences updated successfully',
        preferences
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Preferences update error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to update preferences',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}