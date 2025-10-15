#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Building widgets...');

const postcssConfig = path.join(__dirname, '..', 'postcss.config.mjs');
const postcssBackup = path.join(__dirname, '..', 'postcss.config.mjs.bak');

// Backup PostCSS config if it exists
if (fs.existsSync(postcssConfig)) {
  console.log('📦 Backing up PostCSS config...');
  fs.renameSync(postcssConfig, postcssBackup);
}

try {
  // Build widgets with Vite
  console.log('⚡ Running Vite build...');
  execSync('vite build', { stdio: 'inherit' });
  console.log('✅ Widgets built successfully!');
} catch (error) {
  console.error('❌ Widget build failed:', error.message);
  process.exit(1);
} finally {
  // Restore PostCSS config
  if (fs.existsSync(postcssBackup)) {
    console.log('📦 Restoring PostCSS config...');
    fs.renameSync(postcssBackup, postcssConfig);
  }
}

console.log('✨ Widget build complete!');
