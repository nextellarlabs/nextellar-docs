import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const guidesRoot = path.join(repositoryRoot, 'docs/guides');
const allowedFields = new Set(['title', 'description', 'date', 'tags']);

function walkMarkdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkMarkdownFiles(entryPath);
    return entry.isFile() && /\.mdx?$/.test(entry.name) ? [entryPath] : [];
  });
}

function isValidDate(value) {
  if (value instanceof Date) {
    return (
      !Number.isNaN(value.valueOf()) &&
      /^\d{4}-\d{2}-\d{2}$/.test(value.toISOString().slice(0, 10))
    );
  }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === value
  );
}

function validateFrontmatter(data) {
  const errors = [];
  for (const field of Object.keys(data)) {
    if (!allowedFields.has(field)) errors.push(`unknown field "${field}"`);
  }
  for (const field of ['title', 'description']) {
    if (typeof data[field] !== 'string' || data[field].trim() === '') {
      errors.push(`"${field}" must be a non-empty string`);
    }
  }
  if (data.date !== undefined && !isValidDate(data.date)) {
    errors.push('"date" must be a valid YYYY-MM-DD date');
  }
  if (
    data.tags !== undefined &&
    (!Array.isArray(data.tags) ||
      data.tags.some((tag) => typeof tag !== 'string' || tag.trim() === ''))
  ) {
    errors.push('"tags" must be a list of non-empty strings');
  }
  return errors;
}

const files = walkMarkdownFiles(guidesRoot);
const failures = [];

for (const filePath of files) {
  try {
    const { data } = matter(fs.readFileSync(filePath, 'utf8'));
    for (const error of validateFrontmatter(data)) {
      failures.push(`${path.relative(repositoryRoot, filePath)}: ${error}`);
    }
  } catch (error) {
    failures.push(
      `${path.relative(repositoryRoot, filePath)}: ${error.message}`
    );
  }
}

if (failures.length > 0) {
  console.error(
    `Guide frontmatter validation failed (${failures.length} issue(s)):`
  );
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${files.length} guide frontmatter blocks against the typed schema.`
  );
}
