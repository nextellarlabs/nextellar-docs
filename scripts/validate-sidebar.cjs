// scripts/validate-sidebar.cjs - Validates sidebar and TOC
const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../docs/components');
const sidebarPath = path.join(__dirname, '../config/sidebar.tsx');
const tocPath = path.join(__dirname, '../config/toc.tsx');

console.log('🔍 COMPONENTS INVENTORY (SOURCE OF TRUTH)\n');
const actualFiles = fs.readdirSync(componentsDir)
  .filter(f => f.match(/\.mdx?$/))
  .map(f => f.replace(/\.mdx?$/, ''))
  .sort();
console.log('VALID (' + actualFiles.length + '):', actualFiles.join(', '));

console.log('\n📋 SIDEBAR CLAIMS');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
const claimedLinks = [...sidebarContent.matchAll(/\/docs\/components\/([^'"\s\)},\]#]+)/g)]
  .map(m => m[1])
  .filter(Boolean)
  .filter((v, i, a) => a.indexOf(v) === i) // unique
  .sort();
console.log('CLAIMS (' + claimedLinks.length + '):', claimedLinks.join(', '));

const broken = claimedLinks.filter(link => !actualFiles.includes(link));
console.log('\n❌ BROKEN SIDEBAR LINKS (' + broken.length + '):');
broken.forEach(link => console.log(`  - ${link}`));

const valid = claimedLinks.filter(link => actualFiles.includes(link));
console.log('\n✅ VALID SIDEBAR LINKS (' + valid.length + '):');
valid.forEach(link => console.log(`  - ${link}`));

// Check TOC file
console.log('\n📋 TOC CLAIMS');
const tocContent = fs.readFileSync(tocPath, 'utf8');
const tocLinks = [...tocContent.matchAll(/\/docs\/components\/([^'"\s\)},\]#]+)/g)]
  .map(m => m[1])
  .filter(Boolean)
  .filter((v, i, a) => a.indexOf(v) === i) // unique
  .sort();
console.log('CLAIMS (' + tocLinks.length + '):', tocLinks.join(', '));

const tocBroken = tocLinks.filter(link => !actualFiles.includes(link));
console.log('\n❌ BROKEN TOC ENTRIES (' + tocBroken.length + '):');
tocBroken.forEach(link => console.log(`  - ${link}`));

const tocValid = tocLinks.filter(link => actualFiles.includes(link));
console.log('\n✅ VALID TOC ENTRIES (' + tocValid.length + '):');
tocValid.forEach(link => console.log(`  - ${link}`));

const totalBroken = broken.length + tocBroken.length;
console.log('\n✅ SUMMARY');
console.log(`Sidebar: ${valid.length}/${claimedLinks.length} valid (${claimedLinks.length > 0 ? Math.round(valid.length/claimedLinks.length*100) : 100}%)`);
console.log(`TOC: ${tocValid.length}/${tocLinks.length} valid (${tocLinks.length > 0 ? Math.round(tocValid.length/tocLinks.length*100) : 100}%)`);
console.log(`Total broken: ${totalBroken}`);

if (totalBroken > 0) {
  console.log('\n⚠️  ACTION REQUIRED: Remove broken entries from config files');
  process.exitCode = 1;
} else {
  console.log('\n🎉 ALL COMPONENT REFERENCES ARE VALID!');
}

fs.writeFileSync(
  path.join(__dirname, '../sidebar-validation.json'),
  JSON.stringify({ 
    valid: actualFiles, 
    sidebar: {
      broken,
      claimed: claimedLinks,
      total: claimedLinks.length
    },
    toc: {
      broken: tocBroken,
      claimed: tocLinks,
      total: tocLinks.length
    },
    totalBroken
  }, null, 2)
);
console.log('\n💾 sidebar-validation.json updated');
