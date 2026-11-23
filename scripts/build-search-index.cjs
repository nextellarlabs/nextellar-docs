// scripts/build-search-index.cjs - Generates a client-side search index from docs
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_DIR = path.join(__dirname, '../public');
const INDEX_FILE = path.join(OUTPUT_DIR, 'search-index.json');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function toPosix(p) {
  return p.split(path.sep).join('/');
}

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

function stripMarkdown(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/---+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHeadings(content) {
  if (!content || typeof content !== 'string') return [];
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  const headings = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push(match[1].trim());
  }
  return headings;
}

function loadDocs() {
  const files = walk(DOCS_DIR).sort();
  const docs = [];
  for (const file of files) {
    const sourceFilePath = toPosix(path.relative(DOCS_DIR, file));
    const rawFile = fs.readFileSync(file, 'utf8');
    const { data, content } = matter(rawFile);
    const title = typeof data.title === 'string' ? data.title.trim() : '';
    if (!title) continue;

    const flattenedPath = sourceFilePath.replace(/\.mdx?$/i, '');
    const isVersioned = /^versions\/v[\d.]+(?:-[\w.]+)?\//i.test(sourceFilePath);
    let version = 'latest';
    if (isVersioned) {
      const m = sourceFilePath.match(/^versions\/(v[\d.]+(?:-[\w.]+)?)\//i);
      if (m) version = m[1].slice(1);
    }

    docs.push({
      id: flattenedPath,
      title,
      description: typeof data.description === 'string' ? data.description : '',
      headings: extractHeadings(content),
      body: stripMarkdown(content).substring(0, 500),
      path: `/docs/${flattenedPath}`,
      version,
    });
  }
  return docs;
}

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

function main() {
  console.log('🔍 Building search index...\n');
  const docs = loadDocs();
  console.log(`📄 Loaded ${docs.length} documents from docs\n`);
  writeIndex(docs);
  console.log('\n✅ Search index pipeline complete!');
}

main();
