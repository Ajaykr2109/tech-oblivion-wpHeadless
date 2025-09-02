import { cookies } from 'next/headers'

import { verifySession } from '@/lib/jwt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const WP = process.env.WP_URL
  if (!WP) return new Response(JSON.stringify({ error: 'WP_URL env required' }), { status: 500 })

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(process.env.SESSION_COOKIE_NAME ?? 'session')
  if (!sessionCookie?.value) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  let claims: { wpToken?: string }
  try { claims = await verifySession(sessionCookie.value) as { wpToken?: string } } catch { return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }) }
  const wpToken = claims?.wpToken
  if (!wpToken) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

  // Parse form-data
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return new Response(JSON.stringify({ error: 'Missing file' }), { status: 400 })

  const arrayBuf = await file.arrayBuffer()
  const filename = file.name || 'avatar.jpg'
  const contentType = file.type || 'application/octet-stream'

  // Upload to WP Media Library
  const mediaUrl = new URL('/wp-json/wp/v2/media', WP)
  const uploadRes = await fetch(mediaUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${wpToken}`,
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
    // Use ArrayBuffer directly to satisfy fetch BodyInit
    body: arrayBuf,
  })
  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => '')
    return new Response(JSON.stringify({ error: 'Upload failed', detail: text.slice(0, 1000) }), { status: uploadRes.status })
  }
  const media = await uploadRes.json()

  // Best-effort: try to set a local avatar via common plugin meta
  let avatarSet = false
  try {
    const userPatchUrl = new URL('/wp-json/wp/v2/users/me', WP)
    const patchRes = await fetch(userPatchUrl, {
      method: 'POST', // WP REST Users supports POST for update
      headers: {
        Authorization: `Bearer ${wpToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meta: {
          // Simple Local Avatars plugin support (if registered in REST):
          simple_local_avatar: { media_id: media?.id },
          // WP User Avatar (deprecated) possible key:
          wp_user_avatar: media?.id,
        },
      }),
    })
    avatarSet = patchRes.ok
  } catch {
    // ignore and fall back to returning the uploaded image
  }

  return new Response(
    JSON.stringify({ id: media?.id, url: media?.source_url, setInProfile: avatarSet }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
