import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { compile } from '@mdx-js/mdx';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import highlight from 'rehype-highlight';
import { codeImport } from 'remark-code-import';

export type DocType = 'Docs' | 'VersionedDocs';

export interface Doc {
  type: DocType;
  title: string;
  description?: string;
  date?: string;
  tags?: string[];
  tested_with_cli_version?: string;
  tested_with_node_version?: string;
  body: {
    raw: string;
    code: string;
  };
  _raw: {
    flattenedPath: string;
    sourceFilePath: string;
  };
  url: string;
  slug: string;
  locale: string;
  version: string;
}

const DOCS_DIR = path.join(process.cwd(), 'docs');
const mdxCache = new Map<string, { mtimeMs: number; code: string }>();
let docsCache: { key: string; docs: Doc[] } | null = null;

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function parseVersioned(
  sourceFilePath: string
): { version: string; slug: string } | null {
  const m = sourceFilePath.match(
    /^versions\/(v[\d.]+(?:-[\w.]+)?)\/(.+)\.mdx?$/i
  );
  if (!m) return null;
  return { version: m[1].slice(1), slug: m[2] };
}

function parseLocale(sourceFilePath: string): string {
  const m = sourceFilePath.match(/^i18n\/([\w-]+)\//);
  return m ? m[1] : 'en';
}

async function compileMdx(raw: string, file: string): Promise<string> {
  const stat = fs.statSync(file);
  const cached = mdxCache.get(file);
  if (cached && cached.mtimeMs === stat.mtimeMs) return cached.code;

  const compiled = await compile(raw, {
    outputFormat: 'function-body',
    development: false,
    providerImportSource: undefined,
    remarkPlugins: [remarkGfm, codeImport],
    rehypePlugins: [rehypeSlug, highlight],
  });

  const code = String(compiled);
  mdxCache.set(file, { mtimeMs: stat.mtimeMs, code });
  return code;
}

async function readDoc(file: string): Promise<Doc | null> {
  const sourceFilePath = toPosix(path.relative(DOCS_DIR, file));
  const rawFile = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(rawFile);
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  if (!title) return null;

  const flattenedPath = sourceFilePath.replace(/\.mdx?$/i, '');
  const versioned = parseVersioned(sourceFilePath);
  const type: DocType = sourceFilePath.toLowerCase().startsWith('versions/v')
    ? 'VersionedDocs'
    : 'Docs';

  return {
    type,
    title,
    description:
      typeof data.description === 'string' ? data.description : undefined,
    date: (() => {
      if (data.date == null) return undefined;
      const d =
        data.date instanceof Date ? data.date.toISOString() : String(data.date);
      return Number.isNaN(Date.parse(d)) ? undefined : d;
    })(),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    tested_with_cli_version:
      data.tested_with_cli_version != null
        ? String(data.tested_with_cli_version)
        : undefined,
    tested_with_node_version:
      data.tested_with_node_version != null
        ? String(data.tested_with_node_version)
        : undefined,
    body: { raw: content, code: await compileMdx(content, file) },
    _raw: { flattenedPath, sourceFilePath },
    url: versioned
      ? `/docs/v${versioned.version}/${versioned.slug}`
      : `/docs/${flattenedPath}`,
    slug: versioned ? versioned.slug : flattenedPath,
    locale: parseLocale(sourceFilePath),
    version: versioned ? versioned.version : 'current',
  };
}

function buildKey(files: string[]): string {
  return files
    .map((f) => {
      try {
        return `${f}:${fs.statSync(f).mtimeMs}`;
      } catch {
        return `${f}:missing`;
      }
    })
    .join('|');
}

export async function getAllDocuments(): Promise<Doc[]> {
  const files = walk(DOCS_DIR).sort();
  const key = buildKey(files);
  if (docsCache && docsCache.key === key) return docsCache.docs;

  const docs: Doc[] = [];
  for (const file of files) {
    const doc = await readDoc(file);
    if (doc) docs.push(doc);
  }

  docsCache = { key, docs };
  return docs;
}

export async function getAllDocs(): Promise<Doc[]> {
  return (await getAllDocuments()).filter((d) => d.type === 'Docs');
}

export async function getAllVersionedDocs(): Promise<Doc[]> {
  return (await getAllDocuments()).filter((d) => d.type === 'VersionedDocs');
}
