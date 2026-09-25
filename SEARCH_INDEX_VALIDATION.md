# Search Index Validation

## Overview

This document describes the search index validation system implemented for the Nextellar docs site. The validation step ensures that the generated search index is correct, complete, and ready for production before the build completes.

**Issue:** [#1190](https://github.com/nextellarlabs/nextellar-docs/issues/1190)

## Problem Statement

The docs site's search index is generated as part of the build process using Contentlayer, but there was no validation to ensure it was correct or complete. A broken or stale search index could ship silently, degrading the user experience when searching the docs.

## Solution

A comprehensive validation step now runs as part of the build pipeline that checks:

1. **Index file exists** - The generated index file is present at `.contentlayer/generated/index.mjs`
2. **Index is well-formed** - The index can be parsed and imported successfully
3. **Index is non-empty** - The index contains at least one document (catches silently-failed generation)
4. **All documents have required fields** - Each indexed document has `title`, `url`, `slug`, and `body.raw`
5. **Document URLs follow expected format** - All URLs start with `/docs/` prefix
6. **Document content is non-empty** - No documents have empty body text (catches truncation issues)
7. **All indexed files exist on disk** - Every indexed document corresponds to an actual `.mdx` file in the `docs/` directory
8. **No duplicate entries** - No two documents share the same slug

## Implementation

### Validation Script: `scripts/validate-search-index.mjs`

The main validation script performs all checks listed above and provides clear error messages identifying exactly what failed and where.

**Key features:**
- Dynamically imports the generated Contentlayer index
- Validates index structure and content
- Checks that indexed files exist on disk
- Detects duplicate entries
- Provides detailed error messages with document indices for debugging
- Returns appropriate exit codes (0 for success, 1 for failure)

**Usage:**
```bash
# Run validation standalone
pnpm validate:search-index

# Or as part of the build
pnpm build  # Runs: contentlayer2 build && node scripts/validate-search-index.mjs && next build
```

### Integration with Build Process

Updated `package.json` scripts:

```json
{
  "build": "contentlayer2 build && node scripts/validate-search-index.mjs && next build",
  "validate:search-index": "node scripts/validate-search-index.mjs"
}
```

The validation step runs after Contentlayer generates the index but before Next.js builds the application. This ensures:
- Index is validated locally during development (`pnpm build`)
- CI pipeline catches broken indices before merge
- Build fails fast with clear error messages if index is invalid

### Unit Tests: `scripts/validate-search-index.test.mjs`

Comprehensive unit tests using Vitest and fixture data to validate the validation logic itself. Tests cover:

- **Valid index** - Passes all checks
- **Empty index** - Fails with appropriate error
- **Missing required fields** - Fails for missing title, url, slug, or body.raw
- **Invalid data** - Fails for empty body content, wrong URL format, or duplicate slugs
- **Type validation** - Ensures index is an array, not another type
- **Integration** - Tests against the actual generated index if available

**Run tests:**
```bash
pnpm test:unit scripts/validate-search-index.test.mjs
```

### Fixture Testing: `scripts/test-validation-fixtures.mjs`

Standalone script that demonstrates validation against both valid and broken indices using fixture data. This script validates:

1. ✅ Valid index with multiple documents - **PASSES**
2. ❌ Empty index - **FAILS** with "Index is empty" error
3. ❌ Missing title field - **FAILS** with "Missing or invalid 'title'" error
4. ❌ Empty body content - **FAILS** with "Body content is empty" error
5. ❌ Duplicate slugs - **FAILS** with "Duplicate slug found" error

**Run fixture tests:**
```bash
node scripts/test-validation-fixtures.mjs
```

**Output:**
```
🧪 SEARCH INDEX VALIDATION - FIXTURE TESTING

======================================================================
Testing: Valid Index
======================================================================
✅ VALID - Index passed all checks
   Documents indexed: 2

======================================================================
Testing: Broken: Empty Index
======================================================================
❌ INVALID - Index failed validation:
   ERROR: Index is empty - no documents indexed

[... more test results ...]

📊 TEST SUMMARY
   ✅ Passed: 5
   ❌ Failed: 0
   Total: 5
```

### CI Integration: `.github/workflows/docs-ci.yml`

GitHub Actions workflow with two jobs:

#### Job 1: `build-and-validate`
Full build pipeline that includes:
1. Checkout code
2. Setup Node.js and pnpm
3. Install dependencies
4. **Build content and validate search index** (fails pipeline if invalid)
5. Lint code
6. Check formatting
7. Build Next.js application
8. Run unit tests

#### Job 2: `validate-search-index-only`
Isolated validation job that:
1. Checkout code
2. Setup Node.js and pnpm
3. Install dependencies
4. Build Contentlayer index
5. **Validate search index integrity** (fails if invalid)
6. Run search index unit tests

**Triggers:**
- On push to `main` or `develop` branches
- On pull requests to `main` or `develop` branches

**Key configuration:**
- Uses pnpm 9.15.4 (matching `packageManager` in package.json)
- Caches pnpm dependencies for faster builds
- Validation step fails the entire pipeline if index is invalid (`continue-on-error: false`)
- Other steps are optional failures to not block the build on non-critical issues

## What is "Valid" for the Search Index?

A search index is considered valid if:

1. **Exists** - The index file is present and readable
2. **Parseable** - The index can be imported as a JavaScript module without syntax errors
3. **Non-empty** - Contains at least one indexed document
4. **Well-structured** - Each document has all required fields:
   - `title` (string) - Document title from frontmatter
   - `url` (string) - URL path, must start with `/docs/`
   - `slug` (string) - Document slug from file path
   - `body.raw` (string) - Full document content, must not be empty
5. **Referenced files exist** - Every indexed document's slug corresponds to an actual `.mdx` file
6. **No duplicates** - Each slug appears exactly once in the index

## How to Test Locally

### Test 1: Verify validation passes for current index
```bash
# Generate fresh index and validate
pnpm build:content && pnpm validate:search-index
```

Expected output:
```
✅ Search index validation passed!
   - X documents indexed
   - All required fields present
   - All indexed files exist
   - No duplicate entries
```

### Test 2: Run unit tests
```bash
pnpm test:unit scripts/validate-search-index.test.mjs
```

### Test 3: Run fixture tests
```bash
node scripts/test-validation-fixtures.mjs
```

### Test 4: Full build (includes validation)
```bash
pnpm build
```

This runs: `contentlayer2 build && node scripts/validate-search-index.mjs && next build`

If validation fails, the build stops before Next.js build, showing the error clearly.

## Troubleshooting

### "Search index file not found"
**Cause:** Contentlayer index hasn't been generated yet.
**Solution:** Run `pnpm build:content` first to generate the index.

### "Search index is empty"
**Cause:** No `.mdx` files in `docs/` directory have required `title` frontmatter.
**Solution:** Verify all doc files have `title` frontmatter and are valid MDX.

### "Document [...]: indexed file does not exist"
**Cause:** The index references a document slug that doesn't have a corresponding `.mdx` file.
**Solution:** Either create the missing file or remove it from the docs index.

### "Duplicate document slug found"
**Cause:** Two different doc files are being indexed with the same slug.
**Solution:** Ensure each `.mdx` file has a unique path under `docs/`.

### "Missing or invalid 'title' field"
**Cause:** A document doesn't have a valid `title` in its frontmatter.
**Solution:** Add or fix the `title` field in the document's frontmatter.

### "Body content is empty"
**Cause:** A document's content is empty or only whitespace.
**Solution:** Add content to the document or check if it was corrupted.

## Files Changed

- **scripts/validate-search-index.mjs** - Main validation script
- **scripts/validate-search-index.test.mjs** - Unit tests with Vitest
- **scripts/test-validation-fixtures.mjs** - Fixture-based validation tests
- **package.json** - Added validation scripts and integrated into build pipeline
- **.github/workflows/docs-ci.yml** - CI workflow with validation step

## Build Pipeline Changes

### Before
```
pnpm build: contentlayer2 build && next build
```

### After
```
pnpm build: contentlayer2 build && node scripts/validate-search-index.mjs && next build
```

The validation step now runs in the build pipeline locally and in CI, catching issues before they ship.

## Future Enhancements

Potential future improvements:
- Add validation for frontmatter fields (dates, categories, etc.)
- Check for broken internal links in document content
- Validate that document slugs don't conflict with Next.js routes
- Generate search index statistics report
- Add performance metrics (index size, generation time)

## References

- [Contentlayer Documentation](https://contentlayer.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Issue #1190](https://github.com/nextellarlabs/nextellar-docs/issues/1190)
