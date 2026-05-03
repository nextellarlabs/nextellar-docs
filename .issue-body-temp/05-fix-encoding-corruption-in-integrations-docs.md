# Fix Encoding Corruption in Integrations Docs

**Type:** Documentation Bug Fix
**Labels:** `docs`, `bug`, `integrations`, `content`, `difficulty:medium`
**Complexity:** Medium (250 points)

---

## Dependencies

- None

## Related Issues

- #129
- #130
- #132
- #133

---

## Context

The integrations docs include visible encoding issues in multiple pages, including wallet-related and Soroban-related documentation.

## What Needs to Happen

1. Scan `nextellar-docs/docs/integrations/` for corrupted characters.
2. Clean up broken arrows, malformed symbols, and mojibake text.
3. Keep examples and code formatting intact.

## Files to Modify

- Affected files under `nextellar-docs/docs/integrations/`

## Acceptance Criteria

- [ ] Integrations docs no longer contain visible encoding corruption
- [ ] Code samples remain accurate and readable
- [ ] MDX pages still render correctly

## How to Validate

```bash
cd nextellar-docs
pnpm dev
```

Review the integrations pages in the browser after cleanup.

## PR Requirements

- PR title: `docs: fix encoding corruption in integrations documentation`
