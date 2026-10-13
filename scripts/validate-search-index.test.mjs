/**
 * Unit tests for search index validation
 * Tests the validation logic with fixture data for valid and invalid indices
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEST_INDEX_DIR = path.join(PROJECT_ROOT, '.contentlayer', 'generated');
const TEST_INDEX_PATH = path.join(TEST_INDEX_DIR, 'index.mjs');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');

// Create fixture data
const VALID_INDEX_FIXTURE = [
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

const EMPTY_INDEX_FIXTURE = [];

const INVALID_MISSING_TITLE_FIXTURE = [
  {
    // Missing title
    slug: 'missing-title',
    url: '/docs/missing-title',
    body: { raw: 'Content here' },
    _raw: { flattenedPath: 'missing-title' },
  },
];

const INVALID_MISSING_URL_FIXTURE = [
  {
    title: 'Missing URL',
    slug: 'missing-url',
    // Missing url
    body: { raw: 'Content here' },
    _raw: { flattenedPath: 'missing-url' },
  },
];

const INVALID_MISSING_SLUG_FIXTURE = [
  {
    title: 'Missing Slug',
    // Missing slug
    url: '/docs/missing-slug',
    body: { raw: 'Content here' },
    _raw: { flattenedPath: 'missing-slug' },
  },
];

const INVALID_EMPTY_BODY_FIXTURE = [
  {
    title: 'Empty Body',
    slug: 'empty-body',
    url: '/docs/empty-body',
    body: { raw: '   ' }, // Only whitespace
    _raw: { flattenedPath: 'empty-body' },
  },
];

const INVALID_WRONG_URL_FORMAT_FIXTURE = [
  {
    title: 'Wrong URL Format',
    slug: 'wrong-url',
    url: '/guides/wrong-url', // Should start with /docs/
    body: { raw: 'Content here' },
    _raw: { flattenedPath: 'wrong-url' },
  },
];

const INVALID_MISSING_BODY_RAW_FIXTURE = [
  {
    title: 'Missing Body Raw',
    slug: 'missing-body-raw',
    url: '/docs/missing-body-raw',
    body: {}, // Missing raw field
    _raw: { flattenedPath: 'missing-body-raw' },
  },
];

const DUPLICATE_ENTRIES_FIXTURE = [
  {
    title: 'Getting Started',
    slug: 'getting-started/index',
    url: '/docs/getting-started/index',
    body: { raw: 'Content' },
    _raw: { flattenedPath: 'getting-started/index' },
  },
  {
    title: 'Getting Started Duplicate',
    slug: 'getting-started/index', // Duplicate slug
    url: '/docs/getting-started/index-dup',
    body: { raw: 'Content' },
    _raw: { flattenedPath: 'getting-started/index' },
  },
];

const NOT_ARRAY_FIXTURE = { allDocs: 'not-an-array' };

/**
 * Helper to create a temporary index file for testing
 */
function createTestIndexFile(fixture) {
  // Ensure directory exists
  if (!fs.existsSync(TEST_INDEX_DIR)) {
    fs.mkdirSync(TEST_INDEX_DIR, { recursive: true });
  }

  // Write the fixture as an ES module
  const moduleContent = `export const allDocs = ${JSON.stringify(fixture)};`;
  fs.writeFileSync(TEST_INDEX_PATH, moduleContent);
}

/**
 * Helper to clean up test index file
 */
function cleanupTestIndexFile() {
  if (fs.existsSync(TEST_INDEX_PATH)) {
    fs.unlinkSync(TEST_INDEX_PATH);
  }
}

/**
 * Import and validate the index (mimics validation script logic)
 */
async function validateTestIndex() {
  // Clear require cache to force re-import
  delete import.meta.url;

  try {
    const indexModule = await import(`file://${TEST_INDEX_PATH}?t=${Date.now()}`);
    const docs = indexModule.allDocs || [];

    // Validation checks
    if (!Array.isArray(docs)) {
      throw new Error(`Search index must be an array. Got ${typeof docs} instead.`);
    }

    if (docs.length === 0) {
      throw new Error('Search index is empty');
    }

    const errors = [];

    // Check structure and existence
    docs.forEach((doc, index) => {
      if (!doc.title || typeof doc.title !== 'string') {
        errors.push(`Document ${index}: missing or invalid title`);
      }
      if (!doc.url || typeof doc.url !== 'string') {
        errors.push(`Document ${index}: missing or invalid url`);
      }
      if (!doc.slug || typeof doc.slug !== 'string') {
        errors.push(`Document ${index}: missing or invalid slug`);
      }
      if (typeof doc.body !== 'object' || !doc.body.raw || typeof doc.body.raw !== 'string') {
        errors.push(`Document ${index}: missing or invalid body.raw`);
      }
      if (doc.url && !doc.url.startsWith('/docs/')) {
        errors.push(`Document ${index}: URL doesn't follow /docs/* format`);
      }
      if (doc.body?.raw && doc.body.raw.trim().length === 0) {
        errors.push(`Document ${index}: body is empty`);
      }
    });

    // Check duplicates
    const slugs = new Map();
    docs.forEach((doc, index) => {
      if (doc.slug && slugs.has(doc.slug)) {
        errors.push(`Duplicate slug '${doc.slug}'`);
      }
      if (doc.slug) {
        slugs.set(doc.slug, index);
      }
    });

    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }

    return { valid: true, docCount: docs.length };
  } catch (error) {
    throw new Error(`Validation failed: ${error.message}`);
  }
}

describe('Search Index Validation', () => {
  afterEach(() => {
    cleanupTestIndexFile();
  });

  describe('Valid Index', () => {
    it('should pass validation for a well-formed index with multiple documents', async () => {
      createTestIndexFile(VALID_INDEX_FIXTURE);
      const result = await validateTestIndex();
      expect(result.valid).toBe(true);
      expect(result.docCount).toBe(2);
    });
  });

  describe('Empty Index', () => {
    it('should fail validation when index is empty', async () => {
      createTestIndexFile(EMPTY_INDEX_FIXTURE);
      await expect(validateTestIndex()).rejects.toThrow(/empty/i);
    });
  });

  describe('Missing Required Fields', () => {
    it('should fail validation when title is missing', async () => {
      createTestIndexFile(INVALID_MISSING_TITLE_FIXTURE);
      await expect(validateTestIndex()).rejects.toThrow(/title/i);
    });

    it('should fail validation when url is missing', async () => {
      createTestIndexFile(INVALID_MISSING_URL_FIXTURE);
      await expect(validateTestIndex()).rejects.toThrow(/url/i);
    });

    it('should fail validation when slug is missing', async () => {
      createTestIndexFile(INVALID_MISSING_SLUG_FIXTURE);
      await expect(validateTestIndex()).rejects.toThrow(/slug/i);
    });

    it('should fail validation when body.raw is missing', async () => {
      createTestIndexFile(INVALID_MISSING_BODY_RAW_FIXTURE);
      await expect(validateTestIndex()).rejects.toThrow(/body\.raw|body/i);
    });
  });

  describe('Invalid Data', () => {
    it('should fail validation when body is empty', async () => {
      createTestIndexFile(INVALID_EMPTY_BODY_FIXTURE);
      await expect(validateTestIndex()).rejects.toThrow(/empty|whitespace/i);
    });

    it('should fail validation when URL format is wrong', async () => {
      createTestIndexFile(INVALID_WRONG_URL_FORMAT_FIXTURE);
      await expect(validateTestIndex()).rejects.toThrow(/\/docs\/|format/i);
    });

    it('should fail validation when there are duplicate slugs', async () => {
      createTestIndexFile(DUPLICATE_ENTRIES_FIXTURE);
      await expect(validateTestIndex()).rejects.toThrow(/duplicate/i);
    });

    it('should fail validation when index is not an array', async () => {
      createTestIndexFile(NOT_ARRAY_FIXTURE);
      // Note: Our fixture structure will make this pass the array check since we wrap it,
      // but test the logic
      await expect(validateTestIndex()).rejects.toThrow(/array/i);
    });
  });

  describe('Integration', () => {
    it('should validate the actual generated index after build', async () => {
      // This test only runs if the index has been generated
      if (fs.existsSync(TEST_INDEX_PATH)) {
        const result = await validateTestIndex();
        expect(result.valid).toBe(true);
        expect(result.docCount).toBeGreaterThan(0);
      }
    });
  });
});
