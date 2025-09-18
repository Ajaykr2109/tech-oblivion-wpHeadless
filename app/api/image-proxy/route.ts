import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')
  
  if (!imageUrl) {
    return new Response('Missing url parameter', { status: 400 })
  }

  // Validate that it's from the WordPress site
  const WP_BASE = process.env.WP_URL
  if (!WP_BASE || !imageUrl.startsWith(WP_BASE)) {
    return new Response('Invalid image URL', { status: 400 })
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Next.js Image Proxy',
      },
    })

    if (!response.ok) {
      return new Response('Failed to fetch image', { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return new Response('Image proxy error', { status: 500 })
  }
}