// Test version - simple link checker
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../docs');

// First, just list all files to verify the script runs
console.log('DOCS_DIR:', DOCS_DIR);
console.log('Exists:', fs.existsSync(DOCS_DIR));

function walkDocs(dir = DOCS_DIR, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDocs(filePath, fileList);
    } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const docFiles = walkDocs();
console.log('Found', docFiles.length, 'files');

// Show first 5 files
docFiles.slice(0, 5).forEach(f => {
  console.log('  -', path.relative(DOCS_DIR, f));
});

console.log('✅ Script executed successfully!');
