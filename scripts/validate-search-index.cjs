// scripts/validate-search-index.cjs - Validates the generated search index
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const INDEX_FILE = path.join(__dirname, '../public/search-index.json');
const DOCS_DIR = path.join(__dirname, '../docs');

const VALIDATION_RULES = {
  MIN_FILE_SIZE_BYTES: 1024,
  MIN_DOCUMENT_COUNT: 10,
  REQUIRED_FIELDS: ['version', 'generatedAt', 'documentCount', 'documents'],
  REQUIRED_DOC_FIELDS: ['id', 'title', 'path', 'version'],
};

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function toPosix(p) { return p.split(path.sep).join('/'); }

function validateFileExists() {
  if (!fs.existsSync(INDEX_FILE)) throw new Error(`Index file not found: ${INDEX_FILE}`);
  const stats = fs.statSync(INDEX_FILE);
  if (stats.size < VALIDATION_RULES.MIN_FILE_SIZE_BYTES) {
    throw new Error(`Index file too small (${stats.size} bytes). Expected at least ${VALIDATION_RULES.MIN_FILE_SIZE_BYTES} bytes.`);
  }
  console.log(`✅ Index file exists and has reasonable size (${(stats.size / 1024).toFixed(2)} KB)`);
}

function validateSchema(indexData) {
  for (const field of VALIDATION_RULES.REQUIRED_FIELDS) {
    if (!(field in indexData)) throw new Error(`Missing required top-level field: ${field}`);
  }
  if (!Array.isArray(indexData.documents)) throw new Error('documents field must be an array');
  console.log('✅ Index schema is valid');
}

function validateDocumentCount(indexData) {
  const count = indexData.documents.length;
  if (count < VALIDATION_RULES.MIN_DOCUMENT_COUNT) {
    throw new Error(`Too few documents indexed (${count}). Expected at least ${VALIDATION_RULES.MIN_DOCUMENT_COUNT}.`);
  }
  console.log(`✅ Document count is healthy (${count} documents)`);
}

function validateDocuments(indexData) {
  let invalidCount = 0;
  for (let i = 0; i < indexData.documents.length; i++) {
    const doc = indexData.documents[i];
    for (const field of VALIDATION_RULES.REQUIRED_DOC_FIELDS) {
      if (!(field in doc)) { invalidCount++; break; }
    }
    if (doc.path && !doc.path.startsWith('/docs/')) invalidCount++;
  }
  if (invalidCount > 0) throw new Error(`Found ${invalidCount} documents with invalid structure or missing fields`);
  console.log(`✅ All ${indexData.documents.length} documents have valid structure`);
}

function validatePathsAgainstSource(indexData) {
  const sourcePaths = new Set();
  for (const file of walk(DOCS_DIR)) {
    const rel = toPosix(path.relative(DOCS_DIR, file)).replace(/\.mdx?$/i, '');
    const raw = fs.readFileSync(file, 'utf8');
    const { data } = matter(raw);
    if (typeof data.title === 'string' && data.title.trim()) sourcePaths.add(`/docs/${rel}`);
  }
  let missingCount = 0;
  for (const doc of indexData.documents) {
    if (!sourcePaths.has(doc.path)) missingCount++;
  }
  if (missingCount > 0) throw new Error(`Found ${missingCount} index entries pointing to non-existent pages.`);
  console.log(`✅ All ${indexData.documents.length} index paths exist in source`);
}

function validateContent(indexData) {
  let emptyTitles = 0;
  let emptyBodies = 0;
  for (const doc of indexData.documents) {
    if (!doc.title || !String(doc.title).trim()) emptyTitles++;
    if (!doc.body || !String(doc.body).trim()) emptyBodies++;
  }
  const emptyRate = ((emptyTitles + emptyBodies) / (indexData.documents.length * 2)) * 100;
  if (emptyRate > 50) throw new Error(`Content validation failed: ${emptyRate.toFixed(1)}% empty.`);
  console.log('✅ Content validation passed');
}

function main() {
  console.log('🔍 Validating search index...\n');
  try {
    validateFileExists();
    const indexData = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
    validateSchema(indexData);
    validateDocumentCount(indexData);
    validateDocuments(indexData);
    validatePathsAgainstSource(indexData);
    validateContent(indexData);
    console.log('\n✅ All validation checks passed!');
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Validation failed: ${error.message}`);
    process.exit(1);
  }
}

main();
