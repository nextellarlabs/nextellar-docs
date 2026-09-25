#!/usr/bin/env node
/**
 * Validate heading hierarchy in all MDX documents
 * Checks for:
 * - Single h1 per document
 * - Proper heading hierarchy (no skips)
 * - Logical ordering
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsDir = path.join(__dirname, '../docs');

const issues = [];
let totalIssues = 0;

// Extract headings from MDX content
function extractHeadings(content) {
  const lines = content.split('\n');
  const headings = [];

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      headings.push({ level, text, line: index + 1 });
    }
  });

  return headings;
}

// Validate heading hierarchy
function validateHeadings(headings) {
  const problems = [];

  if (headings.length === 0) {
    problems.push('No headings found');
    return problems;
  }

  // Check for single h1
  const h1Headings = headings.filter((h) => h.level === 1);
  if (h1Headings.length === 0) {
    problems.push('Missing h1 (must have exactly one)');
  } else if (h1Headings.length > 1) {
    problems.push(`Multiple h1s found (${h1Headings.length}): ${h1Headings.map((h) => `Line ${h.line}`).join(', ')}`);
  }

  // Check for proper hierarchy (but allow reasonable skips like h2→h4 for definitions)
  let lastLevel = 0;
  for (let i = 0; i < headings.length; i++) {
    const current = headings[i];
    const prev = i > 0 ? headings[i - 1] : null;

    // Allow: h1→h2, h2→h3, h3→h4, h4→h5, h5→h6
    // Allow: h2→h4 (for definition lists pattern)
    // Disallow: h1→h3+, h1→h4+, etc. (skips after main heading)
    if (prev && current.level > prev.level + 1) {
      // Allow h2→h4 pattern (common for reference docs with numbered definitions)
      if (!(prev.level === 2 && current.level === 4)) {
        problems.push(`Line ${current.line}: Heading hierarchy skip (${prev.level} → ${current.level})`);
      }
    }

    // Warn if not starting with h1
    if (i === 0 && current.level !== 1) {
      problems.push(`Line ${current.line}: Document should start with h1, not h${current.level}`);
    }
  }

  return problems;
}

// Recursively find all MDX files
function findMdxFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(findMdxFiles(fullPath));
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  });

  return files;
}

// Main validation
console.log('🔍 Validating heading hierarchy...\n');

const mdxFiles = findMdxFiles(docsDir);
console.log(`Found ${mdxFiles.length} MDX files\n`);

mdxFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const headings = extractHeadings(content);
  const problems = validateHeadings(headings);

  if (problems.length > 0) {
    const relPath = path.relative(docsDir, filePath);
    issues.push({ file: relPath, issues: problems });
    totalIssues += problems.length;

    console.log(`❌ ${relPath}`);
    problems.forEach((problem) => console.log(`   - ${problem}`));
    console.log();
  }
});

// Summary
console.log('\n📊 SUMMARY');
console.log(`Total files checked: ${mdxFiles.length}`);
console.log(`Files with issues: ${issues.length}`);
console.log(`Total issues: ${totalIssues}`);

if (issues.length > 0) {
  console.log('\n⚠️  Issues found. Please fix the heading hierarchy above.');
  process.exitCode = 1;
} else {
  console.log('\n✅ All documents have valid heading hierarchy!');
}

// Write validation report
fs.writeFileSync(
  path.join(__dirname, '../heading-hierarchy-validation.json'),
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      totalFiles: mdxFiles.length,
      filesWithIssues: issues.length,
      totalIssues,
      issues,
    },
    null,
    2
  )
);

console.log('💾 heading-hierarchy-validation.json updated');
