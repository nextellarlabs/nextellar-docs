#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const docsDir = 'c:\\Users\\Nuelthewave\\Desktop\\NT PR\\nextellar-docs';

try {
  console.log('Starting git operations...\n');

  // Change to docs directory
  process.chdir(docsDir);
  console.log('✓ Changed to:', docsDir);

  // Create branch
  console.log('\n1. Creating branch docs/frontmatter-audit...');
  try {
    execSync('git checkout -b docs/frontmatter-audit', { stdio: 'inherit' });
  } catch (e) {
    // Branch might already exist, try switching to it
    console.log('  Branch may already exist, switching...');
    execSync('git checkout docs/frontmatter-audit', { stdio: 'inherit' });
  }
  console.log('✓ Branch ready');

  // Stage changes
  console.log('\n2. Staging files...');
  execSync('git add package.json scripts/audit-frontmatter-comprehensive.cjs FRONTMATTER_AUDIT_REPORT.md', { stdio: 'inherit' });
  console.log('✓ Files staged');

  // Show status
  console.log('\n3. Current git status:');
  execSync('git status', { stdio: 'inherit' });

  // Commit
  console.log('\n4. Creating commit...');
  execSync('git commit -m "docs: add frontmatter audit infrastructure and report for issue #1163"', { stdio: 'inherit' });
  console.log('✓ Commit created');

  // Push
  console.log('\n5. Pushing to remote...');
  execSync('git push -u origin docs/frontmatter-audit', { stdio: 'inherit' });
  console.log('✓ Pushed to remote');

  console.log('\n✅ All git operations completed successfully!');
  process.exit(0);

} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
}
