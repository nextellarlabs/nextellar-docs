// scripts/validate-sidebar.js - BLOCKER UNTIL RUN
const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../docs/components');
const sidebarPath = path.join(__dirname, '../config/sidebar.tsx');

console.log('🔍 COMPONENTS INVENTORY (SOURCE OF TRUTH)\n');
const actualFiles = fs.readdirSync(componentsDir)
  .filter(f => f.match(/\.mdx?$/))
  .map(f => f.replace(/\.mdx?$/, ''))
  .sort();
console.log('VALID (' + actualFiles.length + '):', actualFiles.join(', '));

console.log('\n📋 SIDEBAR CLAIMS');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
const claimedLinks = [...sidebarContent.matchAll(/\/docs\/components\/([^'"\s\)},\]]+)/g)]
  .map(m => m[1])
  .filter(Boolean)
  .sort();
console.log('CLAIMS (' + claimedLinks.length + '):', claimedLinks.join(', '));

const broken = claimedLinks.filter(link => !actualFiles.includes(link));
console.log('\n❌ BROKEN LINKS TO REMOVE (' + broken.length + '):');
broken.forEach(link => console.log(`  - ${link}`));

const valid = claimedLinks.filter(link => actualFiles.includes(link));
console.log('\n✅ VALID LINKS TO KEEP (' + valid.length + '):');
valid.forEach(link => console.log(`  - ${link}`));

console.log('\n✅ SUMMARY');
console.log(`Keep: ${valid.length}/${claimedLinks.length} (${Math.round(valid.length/claimedLinks.length*100)}%)`);
console.log(`Remove: ${broken.length}/${claimedLinks.length} (${Math.round(broken.length/claimedLinks.length*100)}%)`);
console.log(`Post-cleanup: ${valid.length}/${actualFiles.length} available components in sidebar`);

fs.writeFileSync(
  path.join(__dirname, '../sidebar-validation.json'),
  JSON.stringify({ 
    valid: actualFiles, 
    broken, 
    claimed: claimedLinks,
    total: claimedLinks.length 
  }, null, 2)
);
console.log('\n💾 sidebar-validation.json created');
