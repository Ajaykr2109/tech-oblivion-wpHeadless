#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Post-build script to copy static assets to standalone build directory
 * This ensures CSS and other static files are available in production
 */

async function copyStaticAssets() {
  const sourceDir = path.join(process.cwd(), '.next/static');
  const targetDir = path.join(process.cwd(), '.next/standalone/.next/static');
  
  console.log('🔧 Copying static assets for standalone build...');
  
  try {
    // Check if source directory exists
    if (!fs.existsSync(sourceDir)) {
      console.log('❌ Source .next/static directory not found. Run npm run build first.');
      process.exit(1);
    }
    
    // Create target directory if it doesn't exist
    if (!fs.existsSync(path.dirname(targetDir))) {
      fs.mkdirSync(path.dirname(targetDir), { recursive: true });
    }
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Copy static directory recursively
    await copyDirectory(sourceDir, targetDir);
    
    // Also copy public directory to standalone
    const publicSource = path.join(process.cwd(), 'public');
    const publicTarget = path.join(process.cwd(), '.next/standalone/public');
    
    if (fs.existsSync(publicSource)) {
      await copyDirectory(publicSource, publicTarget);
      console.log('✅ Public assets copied to standalone build');
    }
    
    console.log('✅ Static assets successfully copied to standalone build');
    console.log(`   From: ${sourceDir}`);
    console.log(`   To: ${targetDir}`);
    
  } catch (error) {
    console.error('❌ Error copying static assets:', error.message);
    process.exit(1);
  }
}

async function copyDirectory(source, target) {
  // Create target directory
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  const files = fs.readdirSync(source);
  
  for (const file of files) {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);
    
    const stat = fs.statSync(sourcePath);
    
    if (stat.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

// Run the script
copyStaticAssets();