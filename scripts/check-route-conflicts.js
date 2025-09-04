#!/usr/bin/env node
// Local route collision checker
// Tests redirect rules and identifies route conflicts

const path = require('path')
const fs = require('fs')

// Simulated Next.js route resolution
function findRouteFiles(dir, routes = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    
    if (item.isDirectory()) {
      // Skip special directories
      if (item.name.startsWith('_') || item.name.startsWith('.')) continue
      findRouteFiles(fullPath, routes)
    } else if (item.name === 'page.tsx' || item.name === 'page.ts') {
      // Convert file path to route
      const route = dir
        .replace(process.cwd(), '')
        .replace(/\\/g, '/')
        .replace(/^\/?(app|src\/app)/, '')
        .replace(/\/\[([^\]]+)\]/g, '/:$1')
        || '/'
      
      routes.push({
        route,
        file: fullPath,
        tree: dir.includes('src/app') ? 'src/app' : 'app'
      })
    }
  }
  
  return routes
}

// Check both routing trees
const appRoutes = findRouteFiles(path.join(process.cwd(), 'app'))
const srcAppRoutes = findRouteFiles(path.join(process.cwd(), 'src', 'app'))

console.log('🔍 Route Collision Analysis\n')

// Find duplicates
const allRoutes = [...appRoutes, ...srcAppRoutes]
const routeMap = new Map()

for (const route of allRoutes) {
  if (!routeMap.has(route.route)) {
    routeMap.set(route.route, [])
  }
  routeMap.get(route.route).push(route)
}

// Report conflicts
console.log('📊 Route Conflicts (Next.js will prefer app/* over src/app/*):')
console.log('================================================================')

for (const [route, implementations] of routeMap.entries()) {
  if (implementations.length > 1) {
    console.log(`\n❌ CONFLICT: ${route}`)
    implementations.forEach((impl, i) => {
      const winner = i === 0 && impl.tree === 'app' ? ' 🏆 WINNER' : ''
      console.log(`   ${impl.tree}: ${path.relative(process.cwd(), impl.file)}${winner}`)
    })
  }
}

console.log('\n✅ Unique Routes:')
console.log('==================')

for (const [route, implementations] of routeMap.entries()) {
  if (implementations.length === 1) {
    const impl = implementations[0]
    console.log(`${route} (${impl.tree})`)
  }
}

// Test redirect rules
console.log('\n🛣️  Redirect Rules Test:')
console.log('=========================')

const redirectRules = [
  { from: '/profile', to: '/author/:slug*', note: 'Needs middleware to resolve user slug' },
  { from: '/user/john-doe', to: '/author/john-doe', note: 'Direct mapping' },
  { from: '/wp/users/jane-smith', to: '/author/jane-smith', note: 'Direct mapping' },
  { from: '/blogs/my-post', to: '/blog/my-post', note: 'Path rewrite' },
]

redirectRules.forEach(rule => {
  console.log(`${rule.from} → ${rule.to} (${rule.note})`)
})

// Priority analysis
console.log('\n🎯 Resolution Priority (in Next.js):')
console.log('=====================================')
console.log('1. app/* (legacy tree) - CURRENT WINNER')
console.log('2. src/app/* (canonical tree) - TARGET')
console.log('')
console.log('⚠️  To fix: Move or remove app/* files so src/app/* becomes active')

// Export results for testing
const results = {
  conflicts: Array.from(routeMap.entries())
    .filter(([_, impls]) => impls.length > 1)
    .map(([route, impls]) => ({ route, implementations: impls })),
  uniqueRoutes: Array.from(routeMap.entries())
    .filter(([_, impls]) => impls.length === 1)
    .map(([route, impls]) => ({ route, implementation: impls[0] })),
  redirectRules,
  totalConflicts: Array.from(routeMap.entries()).filter(([_, impls]) => impls.length > 1).length
}

console.log(`\n📈 Summary: ${results.totalConflicts} conflicts found`)
console.log(`📋 Total routes: ${allRoutes.length}`)
console.log(`🎯 Target: 0 conflicts (all routes in src/app/*)`)

module.exports = results
