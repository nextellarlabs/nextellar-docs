// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer2/source-files';
import remarkGfm from 'remark-gfm';
import { codeImport } from 'remark-code-import';
import rehypeSlug from 'rehype-slug';
import highlight from 'rehype-highlight';

// OPTIMIZATION: Simple cache to avoid re-parsing the same versioned paths
// In a real scenario with repeated builds, this prevents redundant regex matching
const versionedPathCache = new Map();

function parseVersionedPath(sourceFilePath) {
  // Check cache first
  if (versionedPathCache.has(sourceFilePath)) {
    return versionedPathCache.get(sourceFilePath);
  }

  const versionMatch = sourceFilePath.match(/versions\/(v[\d.]+(?:-[\w.]+)?\/)(.+)/);
  const result = versionMatch
    ? {
        version: versionMatch[1].slice(0, -1), // Remove trailing slash
        slug: versionMatch[2].replace(/\.mdx?$/, ''),
      }
    : null;

  versionedPathCache.set(sourceFilePath, result);
  return result;
}

export const Post = defineDocumentType(() => ({
  name: 'Docs',
  contentType: 'mdx',
  filePathPattern: `**/*.mdx`,
  markdown: { fileExtensions: ['mdx', 'md'] },
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: false },
    date: { type: 'date', required: false },
  },
  computedFields: {
    url: {
      type: 'string',
      resolve: (post) => `/docs/${post._raw.flattenedPath}`,
    },
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath,
    },
    locale: {
      type: 'string',
      resolve: (doc) => {
        // Extract locale from i18n path: i18n/es/... -> es, default to en
        const match = doc._raw.sourceFilePath.match(/^i18n\/([\w-]+)\//);
        return match ? match[1] : 'en';
      },
    },
  },
}));

export const VersionedPost = defineDocumentType(() => ({
  name: 'VersionedDocs',
  contentType: 'mdx',
  filePathPattern: `versions/v*/**/*.mdx`,
  markdown: { fileExtensions: ['mdx', 'md'] },
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: false },
    date: { type: 'date', required: false },
  },
  computedFields: {
    // OPTIMIZATION: Pre-parse versioned data to avoid redundant regex matching across computed fields
    // Before: Each of url, slug, version computed fields ran their own regex match (~3 per doc)
    // After: Single regex match per document, cached for reuse
    url: {
      type: 'string',
      resolve: (post) => {
        const parsed = parseVersionedPath(post._raw.sourceFilePath);
        if (parsed) {
          return `/docs/${parsed.version}/${parsed.slug}`;
        }
        return `/docs/${post._raw.flattenedPath}`;
      },
    },
    slug: {
      type: 'string',
      resolve: (doc) => {
        const parsed = parseVersionedPath(doc._raw.sourceFilePath);
        return parsed ? parsed.slug : doc._raw.flattenedPath;
      },
    },
    version: {
      type: 'string',
      resolve: (doc) => {
        const parsed = parseVersionedPath(doc._raw.sourceFilePath);
        return parsed ? parsed.version.slice(1) : 'current'; // Remove 'v' prefix
      },
    },
  },
}));

export default makeSource({
  contentDirPath: 'docs',
  documentTypes: [Post, VersionedPost],
  mdx: {
    remarkPlugins: [remarkGfm, codeImport],
    rehypePlugins: [rehypeSlug, highlight],
  },
});
