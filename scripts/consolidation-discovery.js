#!/usr/bin/env node

/**
 * Comprehensive consolidation discovery script
 * Analyzes duplicates between app/* and src/app/* trees
 */

const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = process.cwd();
const LEGACY_DIR = path.join(ROOT_DIR, 'app');
const CANONICAL_DIR = path.join(ROOT_DIR, 'src', 'app');
const COMPONENTS_DIR = path.join(ROOT_DIR, 'src', 'components');

console.log('🔍 Tech Oblivion Consolidation Discovery');
console.log('========================================\n');

// Helper functions
function getFiles(dir, extension = '', basePath = '') {
  if (!fs.existsSync(dir)) return [];
  
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getFiles(fullPath, extension, path.join(basePath, item)));
    } else if (!extension || item.endsWith(extension)) {
      files.push({
        name: item,
        path: path.join(basePath, item),
        fullPath: fullPath,
        relativePath: path.relative(ROOT_DIR, fullPath).replace(/\\/g, '/')
      });
    }
  }
  
  return files;
}

function findImports(fileContent, targetFile) {
  const imports = [];
  const importRegex = /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = importRegex.exec(fileContent)) !== null) {
    const importPath = match[1];
    if (importPath.includes(targetFile.replace(/\.(tsx?|jsx?)$/, ''))) {
      imports.push(importPath);
    }
  }
  
  return imports;
}

function analyzeRouteConflicts() {
  console.log('📊 Route Conflict Analysis');
  console.log('==========================\n');
  
  const legacyRoutes = getFiles(LEGACY_DIR, '.tsx');
  const canonicalRoutes = getFiles(CANONICAL_DIR, '.tsx');
  
  const conflicts = [];
  const routeMap = new Map();
  
  // Process legacy routes
  legacyRoutes.forEach(file => {
    const route = convertToRoute(file.path);
    if (routeMap.has(route)) {
      routeMap.get(route).push({ ...file, tree: 'legacy' });
    } else {
      routeMap.set(route, [{ ...file, tree: 'legacy' }]);
    }
  });
  
  // Process canonical routes
  canonicalRoutes.forEach(file => {
    const route = convertToRoute(file.path);
    if (routeMap.has(route)) {
      routeMap.get(route).push({ ...file, tree: 'canonical' });
    } else {
      routeMap.set(route, [{ ...file, tree: 'canonical' }]);
    }
  });
  
  // Find conflicts
  for (const [route, files] of routeMap) {
    if (files.length > 1) {
      const legacyFiles = files.filter(f => f.tree === 'legacy');
      const canonicalFiles = files.filter(f => f.tree === 'canonical');
      
      if (legacyFiles.length > 0 && canonicalFiles.length > 0) {
        conflicts.push({
          route,
          legacy: legacyFiles,
          canonical: canonicalFiles,
          winner: 'legacy' // Next.js resolves app/* first
        });
      }
    }
  }
  
  return conflicts;
}

function convertToRoute(filePath) {
  // Convert file path to Next.js route
  return filePath
    .replace(/\/page\.(tsx?|jsx?)$/, '')
    .replace(/\/layout\.(tsx?|jsx?)$/, '')
    .replace(/\[([^\]]+)\]/g, ':$1')
    .replace(/\/index$/, '')
    || '/';
}

function analyzeComponents() {
  console.log('🧩 Component Duplication Analysis');
  console.log('==================================\n');
  
  const components = [
    { pattern: 'reader-toolbar', canonical: 'src/components/reader-toolbar.tsx' },
    { pattern: 'floating-actions', canonical: 'src/components/floating-actions.tsx' },
    { pattern: 'TableOfContents', canonical: 'src/components/toc/TableOfContents.tsx' },
    { pattern: 'toc-list', canonical: 'src/components/toc-list.tsx' },
    { pattern: 'PostActionsMenu', canonical: 'src/components/post/PostActionsMenu.tsx' },
    { pattern: 'post-actions', canonical: 'src/components/post-actions.tsx' }
  ];
  
  const allFiles = getFiles(ROOT_DIR, '.tsx');
  allFiles.push(...getFiles(ROOT_DIR, '.ts'));
  
  const componentUsage = [];
  
  components.forEach(comp => {
    const usage = {
      pattern: comp.pattern,
      canonical: comp.canonical,
      usages: [],
      imports: []
    };
    
    allFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file.fullPath, 'utf8');
        
        // Check for imports
        const imports = findImports(content, comp.pattern);
        if (imports.length > 0) {
          usage.imports.push({
            file: file.relativePath,
            imports: imports
          });
        }
        
        // Check for usage in content
        if (content.includes(comp.pattern)) {
          usage.usages.push(file.relativePath);
        }
      } catch (e) {
        // Skip files that can't be read
      }
    });
    
    componentUsage.push(usage);
  });
  
  return componentUsage;
}

function analyzeAPIRoutes() {
  console.log('🔌 API Route Analysis');
  console.log('=====================\n');
  
  const legacyApiDir = path.join(LEGACY_DIR, 'api');
  const canonicalApiDir = path.join(CANONICAL_DIR, 'api');
  
  const legacyRoutes = getFiles(legacyApiDir, '.ts');
  const canonicalRoutes = getFiles(canonicalApiDir, '.ts');
  
  const apiConflicts = [];
  const apiMap = new Map();
  
  // Process all API routes
  [...legacyRoutes, ...canonicalRoutes].forEach(file => {
    const routePath = file.path.replace(/\/route\.ts$/, '');
    const tree = file.fullPath.includes('/app/api/') ? 'legacy' : 'canonical';
    
    if (!apiMap.has(routePath)) {
      apiMap.set(routePath, { legacy: null, canonical: null });
    }
    
    apiMap.get(routePath)[tree] = file;
  });
  
  // Find conflicts and analyze handlers
  for (const [routePath, routes] of apiMap) {
    if (routes.legacy && routes.canonical) {
      const legacyHandlers = analyzeHttpHandlers(routes.legacy.fullPath);
      const canonicalHandlers = analyzeHttpHandlers(routes.canonical.fullPath);
      
      apiConflicts.push({
        route: `/api${routePath}`,
        legacy: {
          file: routes.legacy.relativePath,
          handlers: legacyHandlers
        },
        canonical: {
          file: routes.canonical.relativePath,
          handlers: canonicalHandlers
        },
        missingInCanonical: legacyHandlers.filter(h => !canonicalHandlers.includes(h))
      });
    }
  }
  
  return apiConflicts;
}

function analyzeHttpHandlers(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const handlers = [];
    
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
    httpMethods.forEach(method => {
      if (content.includes(`export async function ${method}`) || 
          content.includes(`export function ${method}`)) {
        handlers.push(method);
      }
    });
    
    return handlers;
  } catch (e) {
    return [];
  }
}

function generateReport() {
  const routeConflicts = analyzeRouteConflicts();
  const componentUsage = analyzeComponents();
  const apiConflicts = analyzeAPIRoutes();
  
  console.log('📋 CONSOLIDATION DISCOVERY REPORT');
  console.log('=================================\n');
  
  // Route conflicts
  console.log('🛣️  ROUTE CONFLICTS:');
  if (routeConflicts.length === 0) {
    console.log('   ✅ No route conflicts found');
  } else {
    routeConflicts.forEach(conflict => {
      console.log(`   ⚠️  ${conflict.route}`);
      console.log(`      Legacy:    ${conflict.legacy.map(f => f.relativePath).join(', ')}`);
      console.log(`      Canonical: ${conflict.canonical.map(f => f.relativePath).join(', ')}`);
      console.log(`      Winner:    ${conflict.winner} (Next.js resolution order)`);
      console.log('');
    });
  }
  
  // Component usage
  console.log('🧩 COMPONENT USAGE:');
  componentUsage.forEach(comp => {
    const status = comp.imports.length > 0 ? '🟢 USED' : '🔴 UNUSED';
    console.log(`   ${status} ${comp.pattern}`);
    console.log(`      Canonical: ${comp.canonical}`);
    console.log(`      Imports:   ${comp.imports.length} files`);
    if (comp.imports.length > 0) {
      comp.imports.forEach(imp => {
        console.log(`                 ${imp.file} → ${imp.imports.join(', ')}`);
      });
    }
    console.log('');
  });
  
  // API conflicts  
  console.log('🔌 API ROUTE CONFLICTS:');
  if (apiConflicts.length === 0) {
    console.log('   ✅ No API conflicts found');
  } else {
    apiConflicts.forEach(conflict => {
      console.log(`   ⚠️  ${conflict.route}`);
      console.log(`      Legacy:    ${conflict.legacy.file} [${conflict.legacy.handlers.join(', ')}]`);
      console.log(`      Canonical: ${conflict.canonical.file} [${conflict.canonical.handlers.join(', ')}]`);
      if (conflict.missingInCanonical.length > 0) {
        console.log(`      Missing:   ${conflict.missingInCanonical.join(', ')} handlers in canonical`);
      }
      console.log('');
    });
  }
  
  // Summary
  console.log('📊 SUMMARY:');
  console.log(`   Routes to consolidate: ${routeConflicts.length}`);
  console.log(`   API routes to merge:   ${apiConflicts.length}`);
  console.log(`   Components analyzed:   ${componentUsage.length}`);
  console.log(`   Unused components:     ${componentUsage.filter(c => c.imports.length === 0).length}`);
  console.log('');
  
  // Recommendations
  console.log('🎯 RECOMMENDATIONS:');
  console.log('   1. Canonical tree: src/app/*');
  console.log('   2. Remove legacy: app/*');
  console.log('   3. Migrate missing API handlers');
  console.log('   4. Clean up unused components');
  console.log('   5. Add redirects for changed routes');
}

// Run the analysis
generateReport();
