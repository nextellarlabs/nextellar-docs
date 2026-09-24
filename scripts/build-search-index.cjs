// scripts/build-search-index.cjs - Generates a client-side search index from docs
const fs = require('fs');
const path = require('path');

/**
 * Recursively crawl the .contentlayer/generated directory and extract searchable content.
 * After `contentlayer2 build` runs, documents are serialized in the `allDocs.json` file.
 *
 * Each doc entry includes: title, description, body, _raw.flattenedPath, etc.
 * We extract title, headings, and body text to create a lightweight, queryable index.
 */

const CONTENTLAYER_DIR = path.join(__dirname, '../.contentlayer/generated');
const OUTPUT_DIR = path.join(__dirname, '../public');
const INDEX_FILE = path.join(OUTPUT_DIR, 'search-index.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Strip markdown/MDX syntax from raw content for clean indexing
 */
function stripMarkdown(text) {
  if (!text || typeof text !== 'string') return '';
  return (
    text
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`[^`]+`/g, '')
      // Remove HTML tags
      .replace(/<[^>]+>/g, '')
      // Remove markdown links, keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown headers
      .replace(/#{1,6}\s+/g, '')
      // Remove bold/italic
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
      // Remove underscores
      .replace(/_([^_]+)_/g, '$1')
      // Remove horizontal rules
      .replace(/---+/g, '')
      // Remove frontmatter
      .replace(/^---[\s\S]*?---/g, '')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Extract headings from markdown/MDX content.
 * Returns an array of { level, text } objects.
 */
function extractHeadings(content) {
  if (!content || typeof content !== 'string') return [];
  const headingRegex = /^#+\s+(.+)$/gm;
  const headings = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[0].match(/^#+/)[0].length;
    const text = match[1].trim();
    headings.push({ level, text });
  }
  return headings;
}

/**
 * Load all docs from contentlayer's generated output.
 * Returns an array of parsed document objects.
 */
function loadDocs() {
  try {
    // Contentlayer generates .contentlayer/generated/index.js with allDocs export
    const indexPath = path.join(CONTENTLAYER_DIR, 'index.js');
    if (!fs.existsSync(indexPath)) {
      throw new Error(
        `Contentlayer index not found at ${indexPath}. Did you run 'pnpm build:content'?`
      );
    }

    // Read the generated index file
    const content = fs.readFileSync(indexPath, 'utf8');

    // Extract the allDocs export using regex
    // The file exports: export const allDocs = [...]
    const match = content.match(/export const allDocs = (\[[\s\S]*?\])\s*(?:;|export)/);
    if (!match) {
      throw new Error('Could not parse allDocs from contentlayer index');
    }

    const docsJson = match[1];
    // Safely evaluate the JSON array
    const docs = eval('(' + docsJson + ')');
    return docs;
  } catch (error) {
    console.error('❌ Error loading docs from contentlayer:', error.message);
    process.exit(1);
  }
}

/**
 * Build the search index from loaded docs.
 * Each entry contains: id, title, description, headings, body (stripped), path, version
 */
function buildSearchIndex(docs) {
  const index = [];

  for (const doc of docs) {
    if (!doc.title || !doc._raw) continue;

    const rawBody = doc.body?.raw || '';
    const strippedBody = stripMarkdown(rawBody);
    const headings = extractHeadings(rawBody);

    // Determine version from path (e.g., versions/v1.0.0/... -> 1.0.0)
    const isVersioned = doc._raw.sourceFilePath?.includes('versions/');
    let version = 'latest';
    if (isVersioned) {
      const versionMatch = doc._raw.sourceFilePath.match(/versions\/(v[\d.]+(?:-[\w.]+)?)\//);
      if (versionMatch) {
        version = versionMatch[1].slice(1); // Remove 'v' prefix
      }
    }

    const entry = {
      id: doc._raw.flattenedPath,
      title: doc.title,
      description: doc.description || '',
      headings: headings.map((h) => h.text),
      body: strippedBody.substring(0, 500), // Limit body to first 500 chars for size
      path: `/docs/${doc._raw.flattenedPath}`,
      version,
    };

    index.push(entry);
  }

  return index;
}

/**
 * Write the index to a JSON file in the public directory
 */
function writeIndex(index) {
  const output = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    documentCount: index.length,
    documents: index,
  };

  fs.writeFileSync(INDEX_FILE, JSON.stringify(output, null, 2));
  console.log(`✅ Search index generated: ${INDEX_FILE}`);
  console.log(`   Documents indexed: ${index.length}`);
  console.log(`   File size: ${(fs.statSync(INDEX_FILE).size / 1024).toFixed(2)} KB`);
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Building search index...\n');

  const docs = loadDocs();
  console.log(`📄 Loaded ${docs.length} documents from contentlayer\n`);

  const index = buildSearchIndex(docs);
  console.log(`✨ Built index with ${index.length} entries\n`);

  writeIndex(index);
  console.log('\n✅ Search index pipeline complete!');
}

main();
