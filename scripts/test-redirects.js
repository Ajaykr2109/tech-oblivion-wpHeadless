#!/usr/bin/env node

/**
 * Test redirect functionality for consolidation
 * Tests the redirects we added in Phase 1A
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

console.log('🔄 Testing Redirect Functionality')
console.log('================================\n')

async function testRedirect(path, expectedDestination) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'HEAD',
      redirect: 'manual' // Don't follow redirects automatically
    })
    
    if (response.status === 308) {
      const location = response.headers.get('location')
      const success = location?.includes(expectedDestination)
      console.log(`${success ? '✅' : '❌'} ${path} → ${location || 'no location header'}`)
      return success
    } else {
      console.log(`❌ ${path} → ${response.status} (expected 308)`)
      return false
    }
  } catch (error) {
    console.log(`❌ ${path} → Error: ${error.message}`)
    return false
  }
}

async function runRedirectTests() {
  console.log('Testing static redirects from next.config.ts:\n')
  
  const tests = [
    { path: '/user/test-user', expected: '/author/test-user' },
    { path: '/wp/users/test-user', expected: '/author/test-user' },
    { path: '/blogs/sample-post', expected: '/blog/sample-post' },
    { path: '/blogs/category/tech', expected: '/blog/category/tech' }
  ]
  
  let passed = 0
  for (const test of tests) {
    const success = await testRedirect(test.path, test.expected)
    if (success) passed++
    await new Promise(resolve => setTimeout(resolve, 100)) // Small delay
  }
  
  console.log(`\n📊 Results: ${passed}/${tests.length} redirects working correctly`)
  
  if (passed === tests.length) {
    console.log('🎉 All static redirects are working!')
  } else {
    console.log('⚠️  Some redirects are not working. Check next.config.ts')
  }
  
  console.log('\n📝 Note: Profile redirect (/profile → /author/[slug]) requires session and should be tested manually')
  console.log('   Test with: curl -I -b "session=valid_token" http://localhost:3000/profile')
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(BASE_URL, { method: 'HEAD' })
    return response.status === 200
  } catch {
    return false
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer()
  
  if (!serverRunning) {
    console.log('❌ Server is not running at', BASE_URL)
    console.log('   Start the dev server with: npm run dev')
    console.log('   Or set BASE_URL environment variable for different server')
    process.exit(1)
  }
  
  await runRedirectTests()
}

main().catch(console.error)
