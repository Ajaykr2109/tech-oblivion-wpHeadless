#!/usr/bin/env node

// Comprehensive linting check script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running comprehensive code quality check...\n');

// Function to run a command and capture output
function runCommand(cmd) {
  try {
    const output = execSync(cmd, { encoding: 'utf8', cwd: process.cwd() });
    return { success: true, output };
  } catch (error) {
    return { success: false, output: error.stdout || error.message };
  }
}

// Check TypeScript compilation
console.log('📋 TypeScript Check:');
const tscResult = runCommand('npx tsc --noEmit');
if (tscResult.success) {
  console.log('✅ TypeScript compilation passed');
} else {
  console.log('❌ TypeScript compilation failed:');
  console.log(tscResult.output);
}

// Check ESLint
console.log('\n📋 ESLint Check:');
const eslintResult = runCommand('npx eslint . --format=compact');
if (eslintResult.success && !eslintResult.output.trim()) {
  console.log('✅ ESLint passed with no issues');
} else {
  console.log('❌ ESLint found issues:');
  console.log(eslintResult.output);
}

// Check for specific patterns
console.log('\n📋 Pattern Analysis:');

// Find any types
const anyTypes = runCommand('grep -r ": any" src/ app/ --include="*.ts" --include="*.tsx" | wc -l');
console.log(`🔍 Found ${anyTypes.output.trim() || '0'} explicit 'any' types`);

// Find empty catch blocks
const emptyCatch = runCommand('grep -r "catch.*{.*}" src/ app/ --include="*.ts" --include="*.tsx" | wc -l');
console.log(`🔍 Found ${emptyCatch.output.trim() || '0'} potential empty catch blocks`);

console.log('\n🎯 Recommendations:');
console.log('1. Replace all `any` types with proper TypeScript interfaces');
console.log('2. Add proper error handling to empty catch blocks');
console.log('3. Run `npm run lint:fix` to auto-fix formatting issues');
console.log('4. Use TypeScript strict mode for better type safety');
