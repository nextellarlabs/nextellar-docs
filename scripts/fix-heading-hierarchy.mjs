#!/usr/bin/env node
/**
 * Fix heading hierarchy issues in MDX documents
 * Automatically converts duplicate h1s and improper hierarchies to h2
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docsDir = path.join(__dirname, '../docs');

let filesFixed = 0;
let totalHeadingsFixed = 0;

// Extract headings from MDX content
function extractHeadings(content) {
  const lines = content.split('\n');
  const headings = [];

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2];
      headings.push({ level, text, line: index + 1, index });
    }
  });

  return headings;
}

// Fix heading hierarchy
function fixHeadings(content) {
  const lines = content.split('\n');
  const headings = extractHeadings(content);

  if (headings.length <= 1) return content; // No issues if 0 or 1 heading

  let fixed = false;
  const h1Indices = headings.filter((h) => h.level === 1).map((h) => h.index);

  // Fix multiple h1s - keep first, convert rest to h2
  if (h1Indices.length > 1) {
    for (let i = 1; i < h1Indices.length; i++) {
      const lineIndex = h1Indices[i];
      const line = lines[lineIndex];
      lines[lineIndex] = line.replace(/^#/, '##'); // Convert # to ##
      fixed = true;
      totalHeadingsFixed++;
    }
  }

  // Fix hierarchy skips - if we jump from h1 to h3+, convert intermediate
  for (let i = 1; i < headings.length; i++) {
    const curr = headings[i];
    const prev = headings[i - 1];

    if (curr.level > prev.level + 1 && prev.level >= 1) {
      // Skip from h1->h3, h2->h4, etc.
      // Convert to prev.level + 1
      const lineIndex = curr.index;
      const line = lines[lineIndex];
      const currentHashes = line.match(/^#+/)[0].length;
      const targetHashes = prev.level + 1;

      // Replace the hashes
      const newLine = '#'.repeat(targetHashes) + line.substring(currentHashes);
      lines[lineIndex] = newLine;
      fixed = true;
      totalHeadingsFixed++;
    }
  }

  return fixed ? lines.join('\n') : content;
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

// Main fix
console.log('🔧 Fixing heading hierarchy...\n');

const mdxFiles = findMdxFiles(docsDir);
console.log(`Processing ${mdxFiles.length} MDX files\n`);

mdxFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fixed = fixHeadings(content);

  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed, 'utf-8');
    const relPath = path.relative(docsDir, filePath);
    console.log(`✅ Fixed: ${relPath}`);
    filesFixed++;
  }
});

// Summary
console.log(`\n📊 SUMMARY`);
console.log(`Files fixed: ${filesFixed}`);
console.log(`Total heading fixes applied: ${totalHeadingsFixed}`);

if (filesFixed > 0) {
  console.log(`\n✨ Heading hierarchy fixed in ${filesFixed} files!`);
} else {
  console.log(`\n✅ All documents already have valid heading hierarchy!`);
}
