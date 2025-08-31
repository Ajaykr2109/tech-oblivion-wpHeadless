#!/usr/bin/env node

// Comprehensive code quality fixer
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting comprehensive code quality fixes...\n');

// Helper to find files recursively
function findFiles(dir, extensions, results = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
      findFiles(filePath, extensions, results);
    } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  }
  return results;
}

// Helper to fix common issues in a file
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix 1: Replace simple any types with unknown in catch blocks
  const beforeCatch = content;
  content = content.replace(/catch\s*\(\s*(\w+):\s*any\s*\)/g, 'catch ($1: unknown)');
  if (content !== beforeCatch) {
    console.log(`  📝 Fixed catch block any types in ${path.relative(process.cwd(), filePath)}`);
    changed = true;
  }

  // Fix 2: Add error handling to empty catch blocks
  const beforeEmpty = content;
  content = content.replace(/catch\s*\(\s*(\w*)\s*\)\s*\{\s*\}/g, (match, errorVar) => {
    const varName = errorVar || 'error';
    return `catch (${varName}) {\n    console.warn('Operation failed:', ${varName})\n  }`;
  });
  if (content !== beforeEmpty) {
    console.log(`  🛡️ Added error handling to empty catch blocks in ${path.relative(process.cwd(), filePath)}`);
    changed = true;
  }

  // Fix 3: Replace simple error any types
  const beforeError = content;
  content = content.replace(/const\s+(\w+):\s*any\s*=\s*new\s+Error/g, 'const $1 = new Error');
  if (content !== beforeError) {
    console.log(`  🔧 Fixed error any types in ${path.relative(process.cwd(), filePath)}`);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

// Find all TypeScript files
const tsFiles = findFiles(process.cwd(), ['.ts', '.tsx']);
const srcFiles = tsFiles.filter(f => f.includes('/src/') || f.includes('/app/'));

console.log(`🔍 Found ${srcFiles.length} TypeScript files to check\n`);

let totalFixed = 0;

// Process each file
for (const file of srcFiles) {
  try {
    if (fixFile(file)) {
      totalFixed++;
    }
  } catch (error) {
    console.log(`❌ Error processing ${file}: ${error.message}`);
  }
}

console.log(`\n✅ Fixed issues in ${totalFixed} files`);

// Run ESLint fix
console.log('\n🔧 Running ESLint auto-fix...');
try {
  execSync('npm run lint:fix', { stdio: 'inherit' });
  console.log('✅ ESLint auto-fix completed');
} catch (error) {
  console.log('❌ ESLint auto-fix encountered issues');
}

// Run type check
console.log('\n🔍 Running TypeScript type check...');
try {
  execSync('npm run typecheck', { stdio: 'inherit' });
  console.log('✅ TypeScript type check passed');
} catch (error) {
  console.log('❌ TypeScript type check found issues');
}

console.log('\n🎉 Code quality improvements completed!');
console.log('📋 Remaining tasks:');
console.log('  1. Review any remaining `any` types and replace with proper interfaces');
console.log('  2. Add specific error handling where needed');
console.log('  3. Test the application to ensure functionality is preserved');
