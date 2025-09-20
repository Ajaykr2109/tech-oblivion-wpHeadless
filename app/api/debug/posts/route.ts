export const dynamic = 'force-dynamic'

export async function GET() {
  const WP = process.env.WP_URL
  console.log('Debug - WP_URL:', WP)
  
  if (!WP) {
    return Response.json({ error: 'WP_URL not configured' }, { status: 500 })
  }
  
  try {
    // Test direct WordPress API call with _embed
    const testUrl = `${WP}/wp-json/wp/v2/posts?per_page=1&_embed=1`
    console.log('Debug - Testing URL:', testUrl)
    
    const res = await fetch(testUrl, {
      headers: {
        'User-Agent': 'techoblivion-debug/1.0',
        'Accept': 'application/json'
      }
    })
    
    console.log('Debug - Response status:', res.status)
    console.log('Debug - Response headers:', Object.fromEntries(res.headers.entries()))
    
    if (!res.ok) {
      const text = await res.text()
      console.log('Debug - Error response:', text)
      return Response.json({ 
        error: 'WordPress API error', 
        status: res.status,
        response: text 
      }, { status: 500 })
    }
    
    const data = await res.json()
    console.log('Debug - Success response sample:', JSON.stringify(data[0] || data, null, 2))
    
    return Response.json({
      success: true,
      wpUrl: WP,
      testUrl,
      dataCount: Array.isArray(data) ? data.length : 1,
      samplePost: data[0] || data,
      hasEmbedded: !!(data[0]?._embedded || data._embedded),
      embedKeys: Object.keys(data[0]?._embedded || data._embedded || {})
    })
    
  } catch (error) {
    console.error('Debug - Fetch error:', error)
    return Response.json({ 
      error: 'Network error', 
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}