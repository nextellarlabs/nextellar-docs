import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const docsRoot = path.join(repositoryRoot, 'docs');
const commonFields = new Set([
  'title',
  'description',
  'date',
  'tested_with_cli_version',
  'tested_with_node_version',
]);
const regularFields = new Set([...commonFields, 'tags']);

function walkMarkdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkMarkdownFiles(entryPath);
    return entry.isFile() && /\.mdx?$/.test(entry.name) ? [entryPath] : [];
  });
}

function isValidDate(value) {
  if (value instanceof Date) return !Number.isNaN(value.valueOf());
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === value
  );
}

function validateFrontmatter(data, filePath) {
  const relativePath = path
    .relative(docsRoot, filePath)
    .split(path.sep)
    .join('/');
  const isVersioned = /^versions\/v[^/]+\//.test(relativePath);
  const allowedFields = isVersioned ? commonFields : regularFields;
  const errors = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return ['frontmatter must be a mapping'];
  }

  for (const field of Object.keys(data)) {
    if (!allowedFields.has(field)) errors.push(`unknown field "${field}"`);
  }
  if (typeof data.title !== 'string' || data.title.trim() === '') {
    errors.push('"title" must be a non-empty string');
  }
  if (
    data.description !== undefined &&
    (typeof data.description !== 'string' || data.description.trim() === '')
  ) {
    errors.push('"description" must be a non-empty string');
  }
  if (data.date !== undefined && !isValidDate(data.date)) {
    errors.push('"date" must be a valid date');
  }
  if (
    data.tags !== undefined &&
    (!Array.isArray(data.tags) ||
      data.tags.some((tag) => typeof tag !== 'string' || tag.trim() === ''))
  ) {
    errors.push('"tags" must be a list of non-empty strings');
  }
  for (const field of ['tested_with_cli_version', 'tested_with_node_version']) {
    if (
      data[field] !== undefined &&
      (typeof data[field] !== 'string' || data[field].trim() === '')
    ) {
      errors.push(`"${field}" must be a non-empty string`);
    }
  }
  return errors;
}

const files = walkMarkdownFiles(docsRoot);
const failures = [];

for (const filePath of files) {
  try {
    const { data } = matter(fs.readFileSync(filePath, 'utf8'));
    for (const error of validateFrontmatter(data, filePath)) {
      failures.push(`${path.relative(repositoryRoot, filePath)}: ${error}`);
    }
  } catch (error) {
    failures.push(
      `${path.relative(repositoryRoot, filePath)}: ${error.message}`
    );
  }
}

if (failures.length > 0) {
  console.error(`Frontmatter validation failed (${failures.length} issue(s)):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${files.length} documentation frontmatter blocks.`);
}
