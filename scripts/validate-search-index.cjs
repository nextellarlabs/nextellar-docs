// scripts/validate-search-index.cjs - Validates the generated search index
const fs = require('fs');
const path = require('path');

const INDEX_FILE = path.join(__dirname, '../public/search-index.json');
const CONTENTLAYER_DIR = path.join(__dirname, '../.contentlayer/generated');

const VALIDATION_RULES = {
  MIN_FILE_SIZE_BYTES: 1024, // At least 1 KB
  MIN_DOCUMENT_COUNT: 10, // At least 10 documents indexed
  REQUIRED_FIELDS: ['version', 'generatedAt', 'documentCount', 'documents'],
  REQUIRED_DOC_FIELDS: ['id', 'title', 'path', 'version'],
};

/**
 * Check if the index file exists and is readable
 */
function validateFileExists() {
  if (!fs.existsSync(INDEX_FILE)) {
    throw new Error(`Index file not found: ${INDEX_FILE}`);
  }

  const stats = fs.statSync(INDEX_FILE);
  if (stats.size < VALIDATION_RULES.MIN_FILE_SIZE_BYTES) {
    throw new Error(
      `Index file too small (${stats.size} bytes). Expected at least ${VALIDATION_RULES.MIN_FILE_SIZE_BYTES} bytes. Possible empty/broken crawl.`
    );
  }

  console.log(`✅ Index file exists and has reasonable size (${(stats.size / 1024).toFixed(2)} KB)`);
}

/**
 * Parse and validate JSON schema of the index
 */
function validateSchema(indexData) {
  // Check top-level structure
  for (const field of VALIDATION_RULES.REQUIRED_FIELDS) {
    if (!(field in indexData)) {
      throw new Error(`Missing required top-level field: ${field}`);
    }
  }

  if (!Array.isArray(indexData.documents)) {
    throw new Error('documents field must be an array');
  }

  console.log(`✅ Index schema is valid`);
}

/**
 * Validate document count
 */
function validateDocumentCount(indexData) {
  const count = indexData.documents.length;
  if (count < VALIDATION_RULES.MIN_DOCUMENT_COUNT) {
    throw new Error(
      `Too few documents indexed (${count}). Expected at least ${VALIDATION_RULES.MIN_DOCUMENT_COUNT}. Possible incomplete crawl.`
    );
  }

  console.log(`✅ Document count is healthy (${count} documents)`);
}

/**
 * Validate individual document structure
 */
function validateDocuments(indexData) {
  let invalidCount = 0;

  for (let i = 0; i < indexData.documents.length; i++) {
    const doc = indexData.documents[i];

    // Check required fields
    for (const field of VALIDATION_RULES.REQUIRED_DOC_FIELDS) {
      if (!(field in doc)) {
        console.warn(
          `⚠️  Document ${i} missing field '${field}': ${JSON.stringify(doc).substring(0, 100)}`
        );
        invalidCount++;
        break;
      }
    }

    // Validate path format
    if (doc.path && !doc.path.startsWith('/docs/')) {
      console.warn(
        `⚠️  Document ${i} has invalid path format: ${doc.path}. Expected to start with /docs/`
      );
      invalidCount++;
    }
  }

  if (invalidCount > 0) {
    throw new Error(
      `Found ${invalidCount} documents with invalid structure or missing fields`
    );
  }

  console.log(`✅ All ${indexData.documents.length} documents have valid structure`);
}

/**
 * Cross-check index paths against actual built docs
 * Loads contentlayer's generated docs and verifies paths match
 */
function validatePathsAgainstSource(indexData) {
  try {
    const indexPath = path.join(CONTENTLAYER_DIR, 'index.js');
    if (!fs.existsSync(indexPath)) {
      console.warn('⚠️  Skipping path validation: contentlayer index not found');
      return;
    }

    const content = fs.readFileSync(indexPath, 'utf8');
    const match = content.match(/export const allDocs = (\[[\s\S]*?\])\s*(?:;|export)/);
    if (!match) {
      console.warn('⚠️  Skipping path validation: could not parse contentlayer docs');
      return;
    }

    const docsJson = match[1];
    const sourceDocs = eval('(' + docsJson + ')');
    const sourcePaths = new Set(sourceDocs.map((d) => `/docs/${d._raw.flattenedPath}`));

    let missingCount = 0;
    for (const doc of indexData.documents) {
      if (!sourcePaths.has(doc.path)) {
        console.warn(`⚠️  Index references non-existent path: ${doc.path}`);
        missingCount++;
      }
    }

    if (missingCount > 0) {
      throw new Error(
        `Found ${missingCount} index entries pointing to non-existent pages. Index may be stale.`
      );
    }

    console.log(`✅ All ${indexData.documents.length} index paths exist in source`);
  } catch (error) {
    if (error.message.includes('non-existent')) {
      throw error;
    }
    console.warn(`⚠️  Path validation error: ${error.message}`);
  }
}

/**
 * Validate that the index is not trivially empty or corrupted
 */
function validateContent(indexData) {
  let emptyTitles = 0;
  let emptyBodies = 0;

  for (const doc of indexData.documents) {
    if (!doc.title || doc.title.trim().length === 0) {
      emptyTitles++;
    }
    if (!doc.body || doc.body.trim().length === 0) {
      emptyBodies++;
    }
  }

  const emptyRate = ((emptyTitles + emptyBodies) / (indexData.documents.length * 2)) * 100;
  if (emptyRate > 50) {
    throw new Error(
      `Content validation failed: ${emptyRate.toFixed(1)}% of content is empty. Index may be corrupted.`
    );
  }

  if (emptyTitles > 0) {
    console.warn(`⚠️  ${emptyTitles} documents have empty titles`);
  }
  if (emptyBodies > 0) {
    console.warn(`⚠️  ${emptyBodies} documents have empty bodies`);
  }

  console.log(`✅ Content validation passed`);
}

/**
 * Main validation routine
 */
function main() {
  console.log('🔍 Validating search index...\n');

  try {
    // 1. File existence and size
    validateFileExists();

    // 2. Parse JSON
    let indexData;
    try {
      const rawContent = fs.readFileSync(INDEX_FILE, 'utf8');
      indexData = JSON.parse(rawContent);
    } catch (error) {
      throw new Error(`Failed to parse index JSON: ${error.message}`);
    }

    // 3. Schema validation
    validateSchema(indexData);

    // 4. Document count
    validateDocumentCount(indexData);

    // 5. Document structure
    validateDocuments(indexData);

    // 6. Path validation
    validatePathsAgainstSource(indexData);

    // 7. Content validation
    validateContent(indexData);

    console.log('\n✅ All validation checks passed!');
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Validation failed: ${error.message}`);
    process.exit(1);
  }
}

main();
