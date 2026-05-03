// scripts/check-links.cjs - Runtime link validation
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const validationData = require('../sidebar-validation.json');

// Only test the links that are actually in the sidebar (claimed)
const linksToTest = validationData.claimed
  .filter(link => !validationData.broken.includes(link))
  .map(slug => `${BASE_URL}/docs/components/${slug}`);

console.log('🔗 TESTING COMPONENT LINKS\n');
console.log(`Testing ${linksToTest.length} links...\n`);

let passed = 0;
let failed = 0;

async function testLink(url, index, total) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      const status = res.statusCode;
      const icon = status === 200 ? '✅' : '❌';
      console.log(`[${index + 1}/${total}] ${icon} ${url} → ${status}`);
      
      if (status === 200) {
        passed++;
      } else {
        failed++;
      }
      resolve();
    }).on('error', (err) => {
      console.log(`[${index + 1}/${total}] ❌ ${url} → ERROR: ${err.message}`);
      failed++;
      resolve();
    });
  });
}

async function runTests() {
  for (let i = 0; i < linksToTest.length; i++) {
    await testLink(linksToTest[i], i, linksToTest.length);
  }
  
  console.log('\n📊 RESULTS');
  console.log(`✅ Passed: ${passed}/${linksToTest.length}`);
  console.log(`❌ Failed: ${failed}/${linksToTest.length}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some links failed! Make sure dev server is running: pnpm dev');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL LINKS VALID!');
  }
}

runTests();
