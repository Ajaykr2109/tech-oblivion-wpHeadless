export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params
  const WP = process.env.WP_URL || process.env.NEXT_PUBLIC_WP_URL
  
  if (!WP) {
    return new Response(JSON.stringify({ error: 'WP_URL env required' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const postIdNum = parseInt(postId, 10)
  if (!postIdNum || !Number.isFinite(postIdNum)) {
    return new Response(JSON.stringify({ error: 'Invalid post ID' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const url = new URL(`/wp-json/fe-auth/v1/post-views/${postIdNum}`, WP.replace(/\/$/, ''))
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': req.headers.get('user-agent') || 'techoblivion-next-proxy',
      },
      cache: 'no-store',
    })

    const text = await response.text()
    
    if (!response.ok) {
      return new Response(text || JSON.stringify({ error: 'wp error' }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(text, { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error fetching post views:', error)
    return new Response(JSON.stringify({ 
      error: 'upstream error', 
      detail: String(error) 
    }), { 
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}