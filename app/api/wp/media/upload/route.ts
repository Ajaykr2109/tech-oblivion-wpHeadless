import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

import { verifySession } from '@/lib/jwt'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const WP_BASE = process.env.WP_URL
  if (!WP_BASE) {
    return new Response('WP_URL env required', { status: 500 })
  }

  // Require authenticated session
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  if (!sessionCookie?.value) return new Response('Unauthorized', { status: 401 })

  let claims: { wpToken?: string }
  try { 
    claims = await verifySession(sessionCookie.value) as { wpToken?: string } 
  } catch { 
    return new Response('Unauthorized', { status: 401 }) 
  }
  
  const wpToken = claims.wpToken
  if (!wpToken) return new Response('Missing upstream token', { status: 401 })

  try {
    // Parse form-data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string || ''
    const alt_text = formData.get('alt_text') as string || ''
    const caption = formData.get('caption') as string || ''
    const description = formData.get('description') as string || ''

    if (!file) {
      return new Response(JSON.stringify({ error: 'Missing file' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const arrayBuffer = await file.arrayBuffer()
    const filename = file.name || 'upload'
    const contentType = file.type || 'application/octet-stream'

    // Upload to WordPress Media Library
    const mediaUrl = new URL('/wp-json/wp/v2/media', WP_BASE)
    const uploadResponse = await fetch(mediaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${wpToken}`,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
      body: arrayBuffer,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text().catch(() => '')
      return new Response(JSON.stringify({ 
        error: 'Upload failed', 
        detail: errorText.slice(0, 1000) 
      }), { 
        status: uploadResponse.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const media = await uploadResponse.json()

    // Update media metadata if provided
    if (title || alt_text || caption || description) {
      try {
        const updateUrl = new URL(`/wp-json/wp/v2/media/${media.id}`, WP_BASE)
        const updateData: Record<string, unknown> = {}
        
        if (title) updateData.title = title
        if (alt_text) updateData.alt_text = alt_text
        if (caption) updateData.caption = caption
        if (description) updateData.description = description

        await fetch(updateUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${wpToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        })
      } catch (error) {
        console.error('Failed to update media metadata:', error)
        // Don't fail the upload for metadata errors
      }
    }

    return new Response(JSON.stringify(media), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Media upload error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to upload media',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}