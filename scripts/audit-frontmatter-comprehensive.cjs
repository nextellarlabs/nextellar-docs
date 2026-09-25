#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const docsDir = path.join(__dirname, '..', 'docs');

/**
 * Extract frontmatter from MDX file using gray-matter
 */
function extractFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(content);
    
    const data = parsed.data || {};
    const title = data.title || null;
    const description = data.description || null;
    
    const missing = [];
    if (!title || title.trim() === '') missing.push('title');
    if (!description || description.trim() === '') missing.push('description');
    
    return {
      title,
      description,
      hasFrontmatter: Object.keys(data).length > 0,
      isEmpty: missing.length > 0,
      missing,
      allFields: data,
    };
  } catch (error) {
    return {
      title: null,
      description: null,
      hasFrontmatter: false,
      isEmpty: true,
      missing: ['title', 'description'],
      error: error.message,
    };
  }
}

/**
 * Recursively walk docs directory
 */
function walkDocs(dir, fileList = []) {
  const files = fs.readdirSync(dir).sort();
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDocs(filePath, fileList);
    } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Main audit
console.log('🔍 Comprehensive Frontmatter Audit\n');
console.log(`Scanning: ${docsDir}\n`);

const allFiles = walkDocs(docsDir);
const results = [];
let missingCount = 0;
let emptyCount = 0;
const missingFiles = [];

for (const filePath of allFiles) {
  const fm = extractFrontmatter(filePath);
  const relPath = path.relative(docsDir, filePath);
  
  results.push({
    file: relPath,
    fullPath: filePath,
    ...fm,
  });

  if (fm.missing.length > 0) {
    missingCount++;
    missingFiles.push({
      file: relPath,
      missing: fm.missing,
      title: fm.title,
      description: fm.description,
    });
    if (fm.isEmpty) emptyCount++;
  }
}

// Sort results
results.sort((a, b) => a.file.localeCompare(b.file));

// Print report
console.log(`📊 Total MDX files: ${allFiles.length}`);
console.log(`✅ Complete: ${allFiles.length - missingCount}`);
console.log(`⚠️  Missing fields: ${missingCount}`);
console.log(`❌ Empty: ${emptyCount}\n`);

if (missingCount > 0) {
  console.log('📝 Files with missing/empty fields:\n');
  for (const file of missingFiles) {
    console.log(`${file.file}`);
    console.log(`  Missing: ${file.missing.join(', ')}`);
    if (file.title) console.log(`  Title: "${file.title.substring(0, 70)}${file.title.length > 70 ? '...' : ''}"`);
    if (file.description) console.log(`  Description: "${file.description.substring(0, 70)}${file.description.length > 70 ? '...' : ''}"`);
    console.log();
  }
} else {
  console.log('✨ All MDX files have complete frontmatter!\n');
}

// Group by directory
const byDirectory = {};
for (const result of results) {
  const dir = path.dirname(result.file) || '/';
  if (!byDirectory[dir]) {
    byDirectory[dir] = { total: 0, complete: 0, missing: 0 };
  }
  byDirectory[dir].total++;
  if (result.missing.length === 0) {
    byDirectory[dir].complete++;
  } else {
    byDirectory[dir].missing++;
  }
}

console.log('📂 Summary by Directory:\n');
for (const [dir, stats] of Object.entries(byDirectory).sort()) {
  const status = stats.missing === 0 ? '✅' : '⚠️';
  console.log(`${status} ${dir}: ${stats.complete}/${stats.total} files complete`);
}

// Save audit data for CI/CD
const auditData = {
  timestamp: new Date().toISOString(),
  totalFiles: allFiles.length,
  completeFiles: allFiles.length - missingCount,
  missingCount,
  emptyCount,
  summary: byDirectory,
  missingFiles: missingFiles,
};

fs.writeFileSync(
  path.join(__dirname, 'audit-frontmatter.json'),
  JSON.stringify(auditData, null, 2)
);

console.log(`\n💾 Audit data saved to: scripts/audit-frontmatter.json`);

// Exit with code 0 if all complete, 1 if any missing
process.exit(missingCount > 0 ? 1 : 0);
