#!/usr/bin/env node
/**
 * scripts/create-version-snapshot.cjs
 * 
 * Creates an immutable snapshot of the current docs at a specific version.
 * Usage: node scripts/create-version-snapshot.cjs <version> [--git-tag]
 * 
 * Examples:
 *   node scripts/create-version-snapshot.cjs 1.0.0
 *   node scripts/create-version-snapshot.cjs 1.0.0 --git-tag
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const docsDir = path.join(projectRoot, 'docs');
const versionsDir = path.join(projectRoot, 'docs', 'versions');
const versionsMetadataFile = path.join(projectRoot, 'docs', 'versions.json');

// Get version from CLI args
const version = process.argv[2];
const gitTag = process.argv.includes('--git-tag');

if (!version) {
  console.error('❌ Error: Version is required');
  console.error('Usage: node scripts/create-version-snapshot.cjs <version> [--git-tag]');
  console.error('Example: node scripts/create-version-snapshot.cjs 1.0.0');
  process.exit(1);
}

// Validate version format (semver-like: 1.0.0, 1.2.3-beta, etc.)
if (!/^\d+\.\d+\.\d+/.test(version)) {
  console.error('❌ Error: Invalid version format. Use semantic versioning (e.g., 1.0.0)');
  process.exit(1);
}

const versionDir = path.join(versionsDir, `v${version}`);

// Check if version already exists
if (fs.existsSync(versionDir)) {
  console.error(`❌ Error: Version v${version} already exists at ${versionDir}`);
  process.exit(1);
}

console.log(`📸 Creating snapshot for v${version}...`);

// Create versions directory if it doesn't exist
if (!fs.existsSync(versionsDir)) {
  fs.mkdirSync(versionsDir, { recursive: true });
  console.log(`✓ Created versions directory`);
}

// Copy current docs (excluding versions/ dir itself)
const copyDocs = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    // Skip the versions directory itself to avoid recursion
    if (file === 'versions' || file === 'versions.json') {
      return;
    }

    if (fs.statSync(srcPath).isDirectory()) {
      copyDocs(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

try {
  copyDocs(docsDir, versionDir);
  console.log(`✓ Copied docs to ${versionDir}`);
} catch (error) {
  console.error(`❌ Error copying docs: ${error.message}`);
  process.exit(1);
}

// Load or create versions metadata file
let versions = [];
if (fs.existsSync(versionsMetadataFile)) {
  try {
    versions = JSON.parse(fs.readFileSync(versionsMetadataFile, 'utf8'));
  } catch (error) {
    console.warn(`⚠️  Warning: Could not parse existing versions.json, starting fresh`);
  }
}

// Add new version metadata
const versionEntry = {
  version,
  released: new Date().toISOString(),
  label: `v${version}`,
  path: `/docs/v${version}`,
};

// Check if version already in metadata
if (!versions.find((v) => v.version === version)) {
  versions.push(versionEntry);
  // Sort versions in reverse order (latest first)
  versions.sort((a, b) => {
    const aParts = a.version.split('.').map(Number);
    const bParts = b.version.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aDiff = (aParts[i] || 0) - (bParts[i] || 0);
      if (aDiff !== 0) return aDiff * -1; // Reverse order
    }
    return 0;
  });
}

// Write updated versions.json
try {
  fs.writeFileSync(versionsMetadataFile, JSON.stringify(versions, null, 2));
  console.log(`✓ Updated versions.json`);
} catch (error) {
  console.error(`❌ Error writing versions.json: ${error.message}`);
  process.exit(1);
}

// Tag with git if requested
if (gitTag) {
  try {
    execSync(`git tag v${version}`, { cwd: projectRoot, stdio: 'pipe' });
    console.log(`✓ Created git tag v${version}`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.warn(`⚠️  Warning: Git tag v${version} already exists`);
    } else {
      console.error(`❌ Error creating git tag: ${error.message}`);
      process.exit(1);
    }
  }
}

console.log(`\n✅ Snapshot created successfully!`);
console.log(`Version: v${version}`);
console.log(`Location: ${versionDir}`);
console.log(`URL: /docs/v${version}/getting-started/introduction`);
console.log(`\nNext steps:`);
console.log(`1. Verify the snapshot: npm run build`);
console.log(`2. Test locally: npm run dev`);
console.log(`3. Commit: git add docs/versions/ docs/versions.json && git commit -m "docs: snapshot v${version}"`);
if (!gitTag) {
  console.log(`4. Tag: git tag v${version}`);
}
