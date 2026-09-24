#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const repoPath = path.join(__dirname);

try {
  console.log('📦 Working directory:', repoPath);
  console.log('');
  
  // Change to repo directory and run git commands
  process.chdir(repoPath);
  
  console.log('1️⃣ Staging docs/guides/contributing.mdx...');
  execSync('git add docs/guides/contributing.mdx', { stdio: 'inherit' });
  console.log('✅ Staged successfully\n');
  
  console.log('2️⃣ Creating commit...');
  const commitMessage = `docs(contributing): document check:links and validate:sidebar usage

Adds comprehensive documentation for both validation scripts to the contributing guide:

- check:links: Validates all internal links in documentation files against actual routes and anchors
- validate:sidebar: Validates component links in sidebar.tsx and toc.tsx match actual component files

Includes purpose, commands, example outputs, failure cases, and troubleshooting steps.

Closes #1162`;
  
  execSync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { stdio: 'inherit', shell: true });
  console.log('✅ Commit created successfully\n');
  
  console.log('3️⃣ Pushing to remote...');
  execSync('git push -u origin docs/contributing-validators', { stdio: 'inherit' });
  console.log('✅ Pushed successfully\n');
  
  console.log('🎉 All operations completed successfully!');
  console.log('');
  console.log('Summary:');
  console.log('- Staged: docs/guides/contributing.mdx');
  console.log('- Committed: docs(contributing): document check:links and validate:sidebar usage');
  console.log('- Pushed to: origin/docs/contributing-validators');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
