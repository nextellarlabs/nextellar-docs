# Fix Encoding Corruption in Components Docs

**Type:** Documentation Bug Fix
**Labels:** `docs`, `bug`, `components`, `content`, `difficulty:medium`
**Complexity:** Medium (200 points)

---

## Dependencies

- None

## Related Issues

- #128
- #129
- #130
- #131
- #133

---

## Context

Some component documentation pages contain corrupted text and malformed symbols. These pages should read cleanly, especially since they are often skimmed quickly by developers looking for examples.

## What Needs to Happen

1. Scan `nextellar-docs/docs/components/` for visible encoding corruption.
2. Clean up broken symbols and text corruption.
3. Make sure examples, headings, and descriptions remain accurate.

## Files to Modify

- Affected files under `nextellar-docs/docs/components/`

## Acceptance Criteria

- [ ] Component docs render cleanly without visible mojibake
- [ ] Headings and descriptions remain understandable
- [ ] MDX pages remain valid

## How to Validate

```bash
cd nextellar-docs
pnpm dev
```

Review the components pages in the browser after cleanup.

## PR Requirements

- PR title: `docs: fix encoding corruption in components documentation`
