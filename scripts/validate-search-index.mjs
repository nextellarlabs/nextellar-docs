#!/usr/bin/env node

/**
 * Validates the generated search index to ensure:
 * 1. The index file exists and is well-formed
 * 2. The index is non-empty (contains documents)
 * 3. All indexed documents have required fields (title, url)
 * 4. Document URLs follow expected patterns and point to real doc files
 * 5. No duplicate entries in the index
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const GENERATED_INDEX_PATH = path.join(PROJECT_ROOT, '.contentlayer', 'generated', 'index.mjs');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');

/**
 * Check if index file exists
 */
function checkIndexFileExists() {
  if (!fs.existsSync(GENERATED_INDEX_PATH)) {
    throw new Error(
      `Search index file not found at ${GENERATED_INDEX_PATH}. ` +
      `Run 'pnpm build:content' to generate the index.`
    );
  }
}

/**
 * Dynamically import the generated index
 */
async function loadIndex() {
  try {
    const indexModule = await import(
      `file://${GENERATED_INDEX_PATH}?t=${Date.now()}`
    );
    return indexModule.allDocs || [];
  } catch (error) {
    throw new Error(
      `Failed to load search index: ${error.message}. ` +
      `The index file may be corrupted or malformed. ` +
      `Try running 'pnpm build:content' again.`
    );
  }
}

/**
 * Validate index is non-empty
 */
function validateNonEmpty(docs) {
  if (!Array.isArray(docs)) {
    throw new Error(
      `Search index must be an array. Got ${typeof docs} instead.`
    );
  }

  if (docs.length === 0) {
    throw new Error(
      `Search index is empty. No documents were indexed. ` +
      `Verify that .mdx files exist in the docs/ directory and contain required 'title' frontmatter.`
    );
  }
}

/**
 * Validate individual document structure
 */
function validateDocumentStructure(doc, index) {
  const errors = [];

  // Check required fields
  if (!doc.title || typeof doc.title !== 'string') {
    errors.push(`Document at index ${index}: missing or invalid 'title' field`);
  }

  if (!doc.url || typeof doc.url !== 'string') {
    errors.push(`Document at index ${index}: missing or invalid 'url' field`);
  }

  if (!doc.slug || typeof doc.slug !== 'string') {
    errors.push(`Document at index ${index}: missing or invalid 'slug' field`);
  }

  if (typeof doc.body !== 'object' || !doc.body.raw || typeof doc.body.raw !== 'string') {
    errors.push(
      `Document at index ${index} (${doc.title}): missing or invalid 'body.raw' field`
    );
  }

  // Validate URL format
  if (doc.url && !doc.url.startsWith('/docs/')) {
    errors.push(
      `Document at index ${index} (${doc.title}): URL '${doc.url}' doesn't follow expected format '/docs/*'`
    );
  }

  // Validate body is not empty (catches silently-failed content)
  if (doc.body?.raw && typeof doc.body.raw === 'string' && doc.body.raw.trim().length === 0) {
    errors.push(
      `Document at index ${index} (${doc.title}): body content is empty`
    );
  }

  return errors;
}

/**
 * Validate document URLs correspond to real files
 */
function validateDocumentExists(doc, index) {
  const errors = [];

  if (!doc.slug) {
    return errors;
  }

  const expectedPath = path.join(DOCS_DIR, `${doc.slug}.mdx`);

  if (!fs.existsSync(expectedPath)) {
    errors.push(
      `Document at index ${index} (${doc.title}): ` +
      `indexed file does not exist at ${expectedPath}. ` +
      `This may indicate a stale index entry.`
    );
  }

  return errors;
}

/**
 * Check for duplicate entries
 */
function validateNoDuplicates(docs) {
  const errors = [];
  const seen = new Map();

  docs.forEach((doc, index) => {
    if (!doc.slug) {
      return;
    }

    if (seen.has(doc.slug)) {
      errors.push(
        `Duplicate document slug found: '${doc.slug}' appears at index ${seen.get(doc.slug)} and index ${index}`
      );
    } else {
      seen.set(doc.slug, index);
    }
  });

  return errors;
}

/**
 * Main validation function
 */
async function validateSearchIndex() {
  const errors = [];

  try {
    // Step 1: Check index file exists
    console.log('📋 Checking search index file exists...');
    checkIndexFileExists();
    console.log('✓ Index file found');

    // Step 2: Load and parse index
    console.log('📦 Loading search index...');
    const docs = await loadIndex();
    console.log(`✓ Index loaded successfully`);

    // Step 3: Validate non-empty
    console.log('📊 Validating index is non-empty...');
    validateNonEmpty(docs);
    console.log(`✓ Index contains ${docs.length} documents`);

    // Step 4: Check for duplicates first (efficient early exit)
    console.log('🔍 Checking for duplicate entries...');
    errors.push(...validateNoDuplicates(docs));
    if (errors.length > 0) {
      throw new Error(errors.join('\n  '));
    }
    console.log('✓ No duplicate entries found');

    // Step 5: Validate each document's structure and existence
    console.log('✓ Validating document structures and file references...');
    docs.forEach((doc, index) => {
      errors.push(...validateDocumentStructure(doc, index));
      errors.push(...validateDocumentExists(doc, index));
    });

    if (errors.length > 0) {
      throw new Error(`\n  ${errors.join('\n  ')}`);
    }

    console.log('✓ All documents valid');

    // Success
    console.log('\n✅ Search index validation passed!');
    console.log(`   - ${docs.length} documents indexed`);
    console.log(`   - All required fields present`);
    console.log(`   - All indexed files exist`);
    console.log(`   - No duplicate entries`);

    return true;
  } catch (error) {
    console.error('\n❌ Search index validation failed:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

// Run validation
validateSearchIndex().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
