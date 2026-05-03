# Fix Encoding Corruption in Getting Started and Index Pages

**Type:** Documentation Bug Fix
**Labels:** `docs`, `bug`, `getting-started`, `content`, `difficulty:medium`
**Complexity:** Medium (200 points)

---

## Dependencies

- None

## Related Issues

- #129
- #130
- #131
- #132

---

## Context

Some landing docs pages and getting-started content include corrupted glyphs or malformed text. These are important onboarding pages, so readability matters a lot here.

## What Needs to Happen

1. Review `nextellar-docs/docs/index.mdx` and the `getting-started` pages for corruption.
2. Replace malformed characters with clean text.
3. Preserve onboarding flow and meaning while cleaning copy.

## Files to Modify

- `nextellar-docs/docs/index.mdx`
- Affected files under `nextellar-docs/docs/getting-started/`

## Acceptance Criteria

- [ ] Index and getting-started pages render with clean text
- [ ] No visible encoding artifacts remain in those pages
- [ ] MDX content remains valid and readable

## How to Validate

```bash
cd nextellar-docs
pnpm dev
```

Review the landing docs index and getting-started pages in the browser.

## PR Requirements

- PR title: `docs: fix encoding corruption in onboarding pages`
