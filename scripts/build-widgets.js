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

  const outputDir = path.join(__dirname, '..', 'public', 'widgets');
  const nestedWidgetsDir = path.join(outputDir, 'widgets');

  if (fs.existsSync(nestedWidgetsDir)) {
    console.log('🧹 Normalizing widget HTML output...');
    const htmlFiles = fs.readdirSync(nestedWidgetsDir).filter((file) => file.endsWith('.html'));

    htmlFiles.forEach((file) => {
      const sourcePath = path.join(nestedWidgetsDir, file);
      const destinationPath = path.join(outputDir, file);
      let html = fs.readFileSync(sourcePath, 'utf8');

      // Ensure asset links point to /widgets/* so they resolve in production
      html = html.replace(/(src|href)="\/(?!widgets\/)/g, '$1="/widgets/');

      fs.writeFileSync(destinationPath, html, 'utf8');
    });

    fs.rmSync(nestedWidgetsDir, { recursive: true, force: true });
    console.log('📁 Moved widget HTML files to /public/widgets');
  }
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
