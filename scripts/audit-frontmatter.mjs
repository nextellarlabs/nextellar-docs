#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(__dirname, '..', 'docs');

/**
 * Extract frontmatter from MDX file
 * Returns { title, description, hasFrontmatter, isEmpty }
 */
function extractFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for frontmatter delimiter
    if (!content.startsWith('---')) {
      return {
        title: null,
        description: null,
        hasFrontmatter: false,
        isEmpty: true,
        missing: ['title', 'description'],
      };
    }

    // Extract frontmatter block
    const endMatch = content.slice(3).match(/\n---\n/);
    if (!endMatch) {
      return {
        title: null,
        description: null,
        hasFrontmatter: false,
        isEmpty: true,
        missing: ['title', 'description'],
      };
    }

    const frontmatterText = content.slice(3, 3 + endMatch.index);
    const lines = frontmatterText.split('\n');
    
    let title = null;
    let description = null;

    for (const line of lines) {
      if (line.startsWith('title:')) {
        title = line.replace(/^title:\s*['"]?(.+?)['"]?\s*$/, '$1').trim();
        title = title.replace(/^['"]|['"]$/g, ''); // Remove quotes if present
      }
      if (line.startsWith('description:')) {
        description = line.replace(/^description:\s*['"]?(.+?)['"]?\s*$/, '$1').trim();
        description = description.replace(/^['"]|['"]$/g, ''); // Remove quotes if present
      }
    }

    const missing = [];
    if (!title || title === '') missing.push('title');
    if (!description || description === '') missing.push('description');

    return {
      title: title || null,
      description: description || null,
      hasFrontmatter: true,
      isEmpty: missing.length === 2,
      missing,
    };
  } catch (error) {
    console.error(`Error reading ${filePath}: ${error.message}`);
    return {
      title: null,
      description: null,
      hasFrontmatter: false,
      isEmpty: true,
      missing: ['title', 'description'],
    };
  }
}

/**
 * Recursively walk docs directory and collect all MDX files
 */
function walkDocs(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
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
console.log('🔍 Frontmatter Audit\n');
console.log(`Scanning: ${docsDir}\n`);

const allFiles = walkDocs(docsDir);
const results = [];
let missingCount = 0;
let emptyCount = 0;

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
    if (fm.isEmpty) emptyCount++;
  }
}

// Sort by file path
results.sort((a, b) => a.file.localeCompare(b.file));

// Report by status
console.log(`📊 Total MDX files: ${allFiles.length}`);
console.log(`✅ Complete: ${allFiles.length - missingCount}`);
console.log(`⚠️  Missing fields: ${missingCount}`);
console.log(`❌ Empty: ${emptyCount}\n`);

if (missingCount > 0) {
  console.log('📝 Files with missing/empty fields:\n');
  
  for (const result of results) {
    if (result.missing.length > 0) {
      console.log(`${result.file}`);
      console.log(`  Missing: ${result.missing.join(', ')}`);
      if (result.title) console.log(`  Title: "${result.title}"`);
      if (result.description) console.log(`  Description: "${result.description.substring(0, 60)}..."`);
      console.log();
    }
  }
}

// Export data for processing
const auditData = {
  timestamp: new Date().toISOString(),
  totalFiles: allFiles.length,
  completeFiles: allFiles.length - missingCount,
  missingCount,
  emptyCount,
  results: results.map(r => ({
    file: r.file,
    fullPath: r.fullPath,
    title: r.title,
    description: r.description,
    missing: r.missing,
  })),
};

fs.writeFileSync(
  path.join(__dirname, 'audit-frontmatter.json'),
  JSON.stringify(auditData, null, 2)
);

console.log(`💾 Audit data saved to: scripts/audit-frontmatter.json`);

// Exit with code 1 if there are missing fields (for CI/CD)
process.exit(missingCount > 0 ? 1 : 0);
