export async function GET() {
  try {
    console.log('Testing WordPress connection...')
    
    // Test basic WordPress REST API
    const wpUrl = process.env.WP_URL || 'https://techoblivion.in'
    console.log('WordPress URL:', wpUrl)
    
    const testResponse = await fetch(`${wpUrl}/wp-json/wp/v2/posts?per_page=1`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Next.js/15.3.3'
      }
    })
    
    console.log('Basic API Response:', testResponse.status, testResponse.statusText)
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      console.log('Basic API Error:', errorText)
      return new Response(JSON.stringify({ 
        error: 'WordPress basic API failed', 
        status: testResponse.status,
        statusText: testResponse.statusText,
        details: errorText
      }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      })
    }
    
    const basicData = await testResponse.json()
    console.log('Basic API Success, posts count:', Array.isArray(basicData) ? basicData.length : 'not array')
    
    // Test JWT endpoint availability
    const jwtResponse = await fetch(`${wpUrl}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Next.js/15.3.3'
      },
      body: JSON.stringify({ username: 'test', password: 'test' })
    })
    
    console.log('JWT Response:', jwtResponse.status, jwtResponse.statusText)
    const jwtData = await jwtResponse.json()
    console.log('JWT Response Data:', jwtData)
    
    return new Response(JSON.stringify({ 
      success: true,
      wpUrl,
      basicApiStatus: testResponse.status,
      jwtApiStatus: jwtResponse.status,
      jwtResponse: jwtData,
      message: 'WordPress connection test completed'
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    })
    
  } catch (error: any) {
    console.error('WordPress connection test failed:', error)
    return new Response(JSON.stringify({ 
      error: 'Connection test failed', 
      details: error.message,
      stack: error.stack
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    })
  }
}
