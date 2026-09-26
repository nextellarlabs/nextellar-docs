// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer2/source-files';
import remarkGfm from 'remark-gfm';
import { codeImport } from 'remark-code-import';
import rehypeSlug from 'rehype-slug';
import highlight from 'rehype-highlight';
import fs from 'fs';
import path from 'path';

export const Post = defineDocumentType(() => ({
  name: 'Docs',
  contentType: 'mdx',
  filePathPattern: `**/*.mdx`,
  markdown: { fileExtensions: ['mdx', 'md'] }, // Ensure it watches these files
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: false },
    date: { type: 'date', required: false },
    tags: { type: 'list', of: { type: 'string' }, required: false },
    tested_with_cli_version: { type: 'string', required: false },
    tested_with_node_version: { type: 'string', required: false },
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
    url: {
      type: 'string',
      resolve: (post) => {
        // Extract version from path: versions/v1.0.0/getting-started/intro -> /docs/v1.0.0/getting-started/intro
        const match = post._raw.sourceFilePath.match(/versions\/(v[\d.]+(?:-[\w.]+)?)\/(.*)/);
        if (match) {
          const [, version, slug] = match;
          return `/docs/${version}/${slug.replace(/\.mdx?$/, '')}`;
        }
        return `/docs/${post._raw.flattenedPath}`;
      },
    },
    slug: {
      type: 'string',
      resolve: (doc) => {
        // Extract slug from versioned path: versions/v1.0.0/getting-started/intro -> getting-started/intro
        const match = doc._raw.sourceFilePath.match(/versions\/v[\d.]+(?:-[\w.]+)?\/(.*)/);
        if (match) {
          return match[1].replace(/\.mdx?$/, '');
        }
        return doc._raw.flattenedPath;
      },
    },
    version: {
      type: 'string',
      resolve: (doc) => {
        // Extract version: versions/v1.0.0/... -> 1.0.0
        const match = doc._raw.sourceFilePath.match(/versions\/(v[\d.]+(?:-[\w.]+)?)\//);
        return match ? match[1].slice(1) : 'current';
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
