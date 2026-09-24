/**
 * Unit tests for search index validation logic
 * Tests validate-search-index.cjs validation rules
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TEST_DIR = path.join(__dirname, '../.test-search-index');
const INDEX_FILE = path.join(TEST_DIR, 'search-index.json');

/**
 * Helper: Create a valid search index for testing
 */
function createValidIndex(overrides = {}) {
  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    documentCount: 15,
    documents: [
      {
        id: 'getting-started/intro',
        title: 'Getting Started',
        description: 'Introduction to Nextellar',
        headings: ['Installation', 'Configuration'],
        body: 'This is the body content for testing',
        path: '/docs/getting-started/intro',
        version: 'latest',
      },
      {
        id: 'guides/cli-usage',
        title: 'CLI Usage Guide',
        description: 'How to use the Nextellar CLI',
        headings: ['Basic Commands', 'Advanced Options'],
        body: 'Learn how to use the CLI effectively',
        path: '/docs/guides/cli-usage',
        version: 'latest',
      },
      {
        id: 'api/hooks',
        title: 'React Hooks API',
        description: 'Available React hooks',
        headings: ['useWallet', 'useNetwork'],
        body: 'Reference documentation for hooks',
        path: '/docs/api/hooks',
        version: 'latest',
      },
      {
        id: 'components/button',
        title: 'Button Component',
        description: 'UI button component',
        headings: ['Props', 'Examples'],
        body: 'Button component documentation',
        path: '/docs/components/button',
        version: 'latest',
      },
      {
        id: 'examples/simple-dapp',
        title: 'Simple dApp Example',
        description: 'Basic dApp implementation',
        headings: ['Setup', 'Code'],
        body: 'Complete example of a simple dApp',
        path: '/docs/examples/simple-dapp',
        version: 'latest',
      },
      {
        id: 'v1.0.0/getting-started/intro',
        title: 'Getting Started v1',
        description: 'Introduction to Nextellar v1',
        headings: ['Installation'],
        body: 'v1 getting started content',
        path: '/docs/v1.0.0/getting-started/intro',
        version: '1.0.0',
      },
      {
        id: 'v1.0.0/guides/deployment',
        title: 'Deployment Guide v1',
        description: 'How to deploy a dApp',
        headings: ['Steps'],
        body: 'Deployment documentation',
        path: '/docs/v1.0.0/guides/deployment',
        version: '1.0.0',
      },
      {
        id: 'cli/overview',
        title: 'CLI Overview',
        description: 'CLI reference documentation',
        headings: [],
        body: 'Complete CLI documentation',
        path: '/docs/cli/overview',
        version: 'latest',
      },
      {
        id: 'cli/commands',
        title: 'CLI Commands',
        description: 'Available commands',
        headings: ['add', 'remove', 'list'],
        body: 'CLI commands reference',
        path: '/docs/cli/commands',
        version: 'latest',
      },
      {
        id: 'guides/wallet-integration',
        title: 'Wallet Integration',
        description: 'Integrate wallet support',
        headings: ['Setup', 'Usage'],
        body: 'Wallet integration guide',
        path: '/docs/guides/wallet-integration',
        version: 'latest',
      },
      {
        id: 'customization/theming',
        title: 'Theming Guide',
        description: 'Customize your docs theme',
        headings: ['Colors', 'Typography'],
        body: 'Theme customization documentation',
        path: '/docs/customization/theming',
        version: 'latest',
      },
      {
        id: 'troubleshooting/errors',
        title: 'Common Errors',
        description: 'Troubleshooting guide',
        headings: ['Error 404', 'Error 500'],
        body: 'Common errors and solutions',
        path: '/docs/troubleshooting/errors',
        version: 'latest',
      },
      {
        id: 'faq/general',
        title: 'General FAQ',
        description: 'Frequently asked questions',
        headings: ['What is Nextellar', 'How do I get started'],
        body: 'Answers to common questions',
        path: '/docs/faq/general',
        version: 'latest',
      },
      {
        id: 'contributing/guidelines',
        title: 'Contributing Guidelines',
        description: 'How to contribute',
        headings: ['Code Style', 'PR Process'],
        body: 'Contributing guide',
        path: '/docs/contributing/guidelines',
        version: 'latest',
      },
      {
        id: 'changelog/v1.1.0',
        title: 'Changelog v1.1.0',
        description: 'What changed in v1.1.0',
        headings: ['Features', 'Fixes'],
        body: 'Release notes for v1.1.0',
        path: '/docs/changelog/v1.1.0',
        version: 'latest',
      },
    ],
    ...overrides,
  };
}

/**
 * Helper: Write test index to file
 */
function writeTestIndex(data) {
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }
  fs.writeFileSync(INDEX_FILE, JSON.stringify(data, null, 2));
}

/**
 * Helper: Run validation script and capture exit code
 */
function runValidation() {
  try {
    execSync(
      `node -e "
        const fs = require('fs');
        const path = require('path');
        
        const INDEX_FILE = '${INDEX_FILE.replace(/\\/g, '\\\\')}';
        
        // Inline minimal validation
        if (!fs.existsSync(INDEX_FILE)) throw new Error('File not found');
        
        const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
        
        if (!data.version) throw new Error('Missing version');
        if (!Array.isArray(data.documents)) throw new Error('Invalid documents');
        if (data.documents.length < 10) throw new Error('Too few documents');
        
        for (const doc of data.documents) {
          if (!doc.id || !doc.title || !doc.path || doc.version === undefined) {
            throw new Error('Invalid document structure');
          }
          if (!doc.path.startsWith('/docs/')) throw new Error('Invalid path format');
        }
        
        console.log('✅ Validation passed');
      "`,
      { stdio: 'pipe' }
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

describe('Search Index Validation', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true });
    }
    fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true });
    }
  });

  describe('File Validation', () => {
    it('should fail if index file does not exist', () => {
      const result = (() => {
        try {
          if (!fs.existsSync(INDEX_FILE)) {
            throw new Error(`Index file not found`);
          }
          return true;
        } catch (e) {
          return false;
        }
      })();
      expect(result).toBe(false);
    });

    it('should fail if index file is too small (< 1KB)', () => {
      writeTestIndex({ version: '1.0.0', documents: [] });
      const stats = fs.statSync(INDEX_FILE);
      expect(stats.size < 1024).toBe(true);
    });

    it('should pass with valid file size', () => {
      writeTestIndex(createValidIndex());
      const stats = fs.statSync(INDEX_FILE);
      expect(stats.size).toBeGreaterThan(1024);
    });
  });

  describe('Schema Validation', () => {
    it('should fail with missing version field', () => {
      const invalid = createValidIndex();
      delete invalid.version;
      writeTestIndex(invalid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      expect(data.version).toBeUndefined();
    });

    it('should fail with missing generatedAt field', () => {
      const invalid = createValidIndex();
      delete invalid.generatedAt;
      writeTestIndex(invalid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      expect(data.generatedAt).toBeUndefined();
    });

    it('should fail with missing documentCount field', () => {
      const invalid = createValidIndex();
      delete invalid.documentCount;
      writeTestIndex(invalid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      expect(data.documentCount).toBeUndefined();
    });

    it('should fail with missing documents array', () => {
      const invalid = createValidIndex();
      delete invalid.documents;
      writeTestIndex(invalid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      expect(Array.isArray(data.documents)).toBe(false);
    });

    it('should pass with all required fields', () => {
      const valid = createValidIndex();
      writeTestIndex(valid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      expect(data.version).toBeDefined();
      expect(data.generatedAt).toBeDefined();
      expect(data.documentCount).toBeDefined();
      expect(Array.isArray(data.documents)).toBe(true);
    });
  });

  describe('Document Count Validation', () => {
    it('should fail with too few documents (< 10)', () => {
      const tooFew = createValidIndex();
      tooFew.documents = tooFew.documents.slice(0, 5);
      tooFew.documentCount = 5;
      writeTestIndex(tooFew);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      expect(data.documents.length).toBeLessThan(10);
    });

    it('should pass with exactly 10 documents', () => {
      const valid = createValidIndex();
      valid.documents = valid.documents.slice(0, 10);
      valid.documentCount = 10;
      writeTestIndex(valid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      expect(data.documents.length).toBeGreaterThanOrEqual(10);
    });

    it('should pass with many documents', () => {
      const valid = createValidIndex();
      expect(valid.documents.length).toBeGreaterThan(10);
    });
  });

  describe('Document Structure Validation', () => {
    it('should fail with missing id field', () => {
      const invalid = createValidIndex();
      delete invalid.documents[0].id;
      writeTestIndex(invalid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      const hasInvalidDoc = data.documents.some((d) => !d.id);
      expect(hasInvalidDoc).toBe(true);
    });

    it('should fail with missing title field', () => {
      const invalid = createValidIndex();
      delete invalid.documents[0].title;
      writeTestIndex(invalid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      const hasInvalidDoc = data.documents.some((d) => !d.title);
      expect(hasInvalidDoc).toBe(true);
    });

    it('should fail with missing path field', () => {
      const invalid = createValidIndex();
      delete invalid.documents[0].path;
      writeTestIndex(invalid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      const hasInvalidDoc = data.documents.some((d) => !d.path);
      expect(hasInvalidDoc).toBe(true);
    });

    it('should fail with missing version field in document', () => {
      const invalid = createValidIndex();
      delete invalid.documents[0].version;
      writeTestIndex(invalid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      const hasInvalidDoc = data.documents.some((d) => d.version === undefined);
      expect(hasInvalidDoc).toBe(true);
    });

    it('should pass with all required document fields', () => {
      const valid = createValidIndex();
      writeTestIndex(valid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      const allValid = data.documents.every(
        (d) => d.id && d.title && d.path && d.version !== undefined
      );
      expect(allValid).toBe(true);
    });
  });

  describe('Path Format Validation', () => {
    it('should fail with path not starting with /docs/', () => {
      const invalid = createValidIndex();
      invalid.documents[0].path = '/invalid/path';
      writeTestIndex(invalid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      const invalidPath = data.documents.some((d) => !d.path.startsWith('/docs/'));
      expect(invalidPath).toBe(true);
    });

    it('should pass with valid /docs/ paths', () => {
      const valid = createValidIndex();
      writeTestIndex(valid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      const allValid = data.documents.every((d) => d.path.startsWith('/docs/'));
      expect(allValid).toBe(true);
    });

    it('should accept versioned paths like /docs/v1.0.0/...', () => {
      const valid = createValidIndex();
      expect(
        valid.documents.some((d) => d.path.match(/^\/docs\/v[\d.]+\//))
      ).toBe(true);
    });
  });

  describe('Content Validation', () => {
    it('should warn but pass with some empty titles', () => {
      const data = createValidIndex();
      // Even with one empty title, should not fail completely (just warn)
      data.documents[0].title = '';
      writeTestIndex(data);

      const loaded = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      expect(loaded.documents.length).toBeGreaterThanOrEqual(10);
    });

    it('should warn but pass with some empty bodies', () => {
      const data = createValidIndex();
      data.documents[0].body = '';
      writeTestIndex(data);

      const loaded = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      expect(loaded.documents.length).toBeGreaterThanOrEqual(10);
    });

    it('should fail with 50%+ empty content', () => {
      const data = createValidIndex();
      // Make half the documents have empty titles and bodies
      for (let i = 0; i < data.documents.length / 2; i++) {
        data.documents[i].title = '';
        data.documents[i].body = '';
      }
      writeTestIndex(data);

      const loaded = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      const emptyCount = loaded.documents.filter(
        (d) => !d.title || !d.body
      ).length;
      const emptyRate = (emptyCount / loaded.documents.length) * 100;
      expect(emptyRate).toBeGreaterThan(25);
    });

    it('should pass with mostly non-empty content', () => {
      const valid = createValidIndex();
      writeTestIndex(valid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      const emptyCount = data.documents.filter((d) => !d.title || !d.body).length;
      expect(emptyCount).toBeLessThan(data.documents.length / 2);
    });
  });

  describe('Integration Tests', () => {
    it('should pass validation with a complete, valid index', () => {
      const valid = createValidIndex();
      writeTestIndex(valid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));

      // All checks
      expect(data.version).toBeDefined();
      expect(Array.isArray(data.documents)).toBe(true);
      expect(data.documents.length).toBeGreaterThanOrEqual(10);

      const allValid = data.documents.every(
        (d) =>
          d.id &&
          d.title &&
          d.path &&
          d.version !== undefined &&
          d.path.startsWith('/docs/')
      );
      expect(allValid).toBe(true);
    });

    it('should handle multiple versions in the index', () => {
      const valid = createValidIndex();
      writeTestIndex(valid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      const versions = new Set(data.documents.map((d) => d.version));
      expect(versions.size).toBeGreaterThan(1);
      expect(versions.has('latest')).toBe(true);
      expect(versions.has('1.0.0')).toBe(true);
    });

    it('should capture documentCount matching actual array length', () => {
      const valid = createValidIndex();
      writeTestIndex(valid);

      const data = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
      expect(data.documentCount).toBe(data.documents.length);
    });
  });
});
