#!/usr/bin/env node

/**
 * Test validation script with fixtures
 * Demonstrates validation against good and broken indices
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEST_INDEX_DIR = path.join(PROJECT_ROOT, '.contentlayer', 'generated');
const TEST_INDEX_PATH = path.join(TEST_INDEX_DIR, 'index.mjs');

// Fixture data
const VALID_FIXTURE = [
  {
    title: 'Getting Started',
    slug: 'getting-started/index',
    url: '/docs/getting-started/index',
    body: { raw: 'This is a comprehensive guide to getting started with our product.' },
    _raw: { flattenedPath: 'getting-started/index' },
  },
  {
    title: 'CLI Commands',
    slug: 'cli/commands',
    url: '/docs/cli/commands',
    body: { raw: 'Documentation for all available CLI commands.' },
    _raw: { flattenedPath: 'cli/commands' },
  },
];

const BROKEN_FIXTURE_EMPTY = [];

const BROKEN_FIXTURE_MISSING_TITLE = [
  {
    slug: 'broken-doc',
    url: '/docs/broken-doc',
    body: { raw: 'This document has no title' },
    _raw: { flattenedPath: 'broken-doc' },
  },
];

const BROKEN_FIXTURE_EMPTY_BODY = [
  {
    title: 'Empty Document',
    slug: 'empty-doc',
    url: '/docs/empty-doc',
    body: { raw: '   ' },
    _raw: { flattenedPath: 'empty-doc' },
  },
];

const BROKEN_FIXTURE_DUPLICATES = [
  {
    title: 'Document 1',
    slug: 'doc-1',
    url: '/docs/doc-1',
    body: { raw: 'First document' },
    _raw: { flattenedPath: 'doc-1' },
  },
  {
    title: 'Document 2',
    slug: 'doc-1', // Duplicate slug!
    url: '/docs/doc-2',
    body: { raw: 'Second document with duplicate slug' },
    _raw: { flattenedPath: 'doc-2' },
  },
];

/**
 * Validation logic
 */
function validateIndex(docs) {
  const errors = [];

  // Check is array
  if (!Array.isArray(docs)) {
    errors.push(`ERROR: Index must be an array, got ${typeof docs}`);
    return errors;
  }

  // Check non-empty
  if (docs.length === 0) {
    errors.push('ERROR: Index is empty - no documents indexed');
    return errors;
  }

  // Check structure
  docs.forEach((doc, idx) => {
    if (!doc.title || typeof doc.title !== 'string') {
      errors.push(`ERROR [Doc ${idx}]: Missing or invalid 'title' field`);
    }
    if (!doc.url || typeof doc.url !== 'string') {
      errors.push(`ERROR [Doc ${idx}]: Missing or invalid 'url' field`);
    }
    if (!doc.slug || typeof doc.slug !== 'string') {
      errors.push(`ERROR [Doc ${idx}]: Missing or invalid 'slug' field`);
    }
    if (!doc.body?.raw || typeof doc.body.raw !== 'string') {
      errors.push(`ERROR [Doc ${idx}]: Missing or invalid 'body.raw' field`);
    }
    if (doc.body?.raw && doc.body.raw.trim().length === 0) {
      errors.push(`ERROR [Doc ${idx} - ${doc.title}]: Body content is empty`);
    }
    if (doc.url && !doc.url.startsWith('/docs/')) {
      errors.push(
        `ERROR [Doc ${idx} - ${doc.title}]: URL '${doc.url}' doesn't follow expected format '/docs/*'`
      );
    }
  });

  // Check duplicates
  const slugs = new Map();
  docs.forEach((doc, idx) => {
    if (doc.slug) {
      if (slugs.has(doc.slug)) {
        errors.push(
          `ERROR: Duplicate slug '${doc.slug}' found at indices ${slugs.get(doc.slug)} and ${idx}`
        );
      } else {
        slugs.set(doc.slug, idx);
      }
    }
  });

  return errors;
}

/**
 * Test a fixture
 */
function testFixture(name, fixture, expectValid = false) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Testing: ${name}`);
  console.log(`${'='.repeat(70)}`);

  const errors = validateIndex(fixture);

  if (errors.length === 0) {
    console.log('✅ VALID - Index passed all checks');
    if (Array.isArray(fixture)) {
      console.log(`   Documents indexed: ${fixture.length}`);
    }
    return expectValid; // Pass if we expected it to be valid
  } else {
    console.log('❌ INVALID - Index failed validation:');
    errors.forEach((error) => console.log(`   ${error}`));
    return !expectValid; // Pass if we expected it to be invalid
  }
}

/**
 * Run all fixture tests
 */
function runTests() {
  console.log('\n🧪 SEARCH INDEX VALIDATION - FIXTURE TESTING\n');

  let passed = 0;
  let failed = 0;

  // Valid fixture
  if (testFixture('Valid Index', VALID_FIXTURE, true)) {
    passed++;
  } else {
    failed++;
  }

  // Broken fixtures
  if (testFixture('Broken: Empty Index', BROKEN_FIXTURE_EMPTY, false)) {
    passed++;
  } else {
    failed++;
  }

  if (testFixture('Broken: Missing Title Field', BROKEN_FIXTURE_MISSING_TITLE, false)) {
    passed++;
  } else {
    failed++;
  }

  if (testFixture('Broken: Empty Body Content', BROKEN_FIXTURE_EMPTY_BODY, false)) {
    passed++;
  } else {
    failed++;
  }

  if (testFixture('Broken: Duplicate Slugs', BROKEN_FIXTURE_DUPLICATES, false)) {
    passed++;
  } else {
    failed++;
  }

  // Summary
  console.log(`\n${'='.repeat(70)}`);
  console.log(`\n📊 TEST SUMMARY`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Total: ${passed + failed}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
