export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

export async function GET(_request: NextRequest) {
  const WP_BASE = process.env.WP_URL
  if (!WP_BASE) {
    return new Response('WP_URL env required', { status: 500 })
  }
  
  interface WordPressSettings {
    title: string
    description: string
    url: string
    email: string
    timezone: string
    date_format: string
    time_format: string
    start_of_week: number
    language: string
    use_smilies: boolean
    default_category: number
    default_post_format: string
    posts_per_page: number
    default_ping_status: string
    default_comment_status: string
  }
  try {
    // WordPress settings endpoint
    const wpUrl = new URL('/wp-json/wp/v2/settings', WP_BASE)

    const response = await fetch(wpUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`)
    }

    const settings = await response.json() as WordPressSettings
    
    // Transform the response to a more usable format
    const transformedSettings = {
      title: settings.title,
      description: settings.description,
      admin_email: settings.email,
      site_url: settings.url,
      language: settings.language,
      posts_per_page: settings.posts_per_page,
      date_format: settings.date_format,
      time_format: settings.time_format,
      timezone: settings.timezone,
      start_of_week: settings.start_of_week,
      use_smilies: settings.use_smilies,
      default_category: settings.default_category,
      default_post_format: settings.default_post_format,
      default_ping_status: settings.default_ping_status,
      default_comment_status: settings.default_comment_status,
    }

    return new Response(JSON.stringify(transformedSettings), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1200'
      }
    })

  } catch (error) {
    console.error('Settings API error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch settings',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export async function POST(_request: NextRequest) {
  const WP_BASE = process.env.WP_URL
  if (!WP_BASE) {
    return new Response('WP_URL env required', { status: 500 })
  }
  try {
    // This would handle settings updates
    // For now, return a not implemented response
    return new Response(
      JSON.stringify({ 
        error: 'Settings update not implemented',
        message: 'Settings update functionality will be implemented soon'
      }),
      { 
        status: 501,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Settings update error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Settings update failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}