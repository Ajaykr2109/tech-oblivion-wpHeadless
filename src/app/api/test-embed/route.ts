import { NextRequest } from 'next/server'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const WP = process.env.WP_URL
  if (!WP) return new Response('WP_URL env required', { status: 500 })
  
  try {
    // Test direct API call to compare
    const directUrl = `${WP}/wp-json/wp/v2/posts?per_page=1&_embed=1`
    const response = await fetch(directUrl, { cache: 'no-store' })
    
    if (!response.ok) {
      return Response.json({ error: 'Failed to fetch from WordPress', status: response.status })
    }
    
    const data = await response.json()
    
    return Response.json({
      success: true,
      url: directUrl,
      postCount: Array.isArray(data) ? data.length : 1,
      hasEmbedded: data[0]?._embedded ? true : false,
      embedKeys: data[0]?._embedded ? Object.keys(data[0]._embedded) : [],
      samplePost: {
        id: data[0]?.id,
        title: data[0]?.title?.rendered,
        author: data[0]?.author,
        featured_media: data[0]?.featured_media,
        embeddedAuthor: data[0]?._embedded?.author?.[0]?.name,
        embeddedMedia: data[0]?._embedded?.['wp:featuredmedia']?.[0]?.source_url
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return Response.json({ error: 'Failed to test API', details: errorMessage })
  }
}