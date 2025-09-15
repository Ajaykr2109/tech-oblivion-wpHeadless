export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const WP_BASE = process.env.WP_URL
  if (!WP_BASE) {
    return new Response('WP_URL env required', { status: 500 })
  }
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const perPage = searchParams.get('per_page') || '20'
    const search = searchParams.get('search') || ''
    const mediaType = searchParams.get('media_type') || ''

    // Build WordPress media endpoint URL
    const wpUrl = new URL('/wp-json/wp/v2/media', WP_BASE)
    wpUrl.searchParams.set('page', page)
    wpUrl.searchParams.set('per_page', perPage)
    
    if (search) {
      wpUrl.searchParams.set('search', search)
    }
    
    if (mediaType) {
      wpUrl.searchParams.set('media_type', mediaType)
    }

    // Add ordering
    wpUrl.searchParams.set('orderby', 'date')
    wpUrl.searchParams.set('order', 'desc')

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

    const media = await response.json()
    
    // Transform the response to include useful metadata
interface MediaItem {
  id: number
  date: string
  slug: string
  title: { rendered: string }
  source_url: string
  alt_text: string
  media_type: string
  mime_type: string
  media_details: Record<string, unknown>
  author: number
}

    const transformedMedia = (media as MediaItem[]).map((item: MediaItem) => ({
      id: item.id,
      date: item.date,
      slug: item.slug,
      title: item.title,
      source_url: item.source_url,
      alt_text: item.alt_text,
      media_type: item.media_type,
      mime_type: item.mime_type,
      media_details: item.media_details,
      author: item.author,
    }))

    return new Response(JSON.stringify(transformedMedia), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
      }
    })

  } catch (error) {
    console.error('Media API error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch media',
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
    // This would handle media uploads
    // For now, return a not implemented response
    return new Response(
      JSON.stringify({ 
        error: 'Media upload not implemented',
        message: 'Media upload functionality will be implemented soon'
      }),
      { 
        status: 501,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Media upload error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Media upload failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}