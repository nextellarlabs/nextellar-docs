# Fix Encoding Corruption in Hooks Docs

**Type:** Documentation Bug Fix
**Labels:** `docs`, `bug`, `hooks`, `content`, `difficulty:medium`
**Complexity:** Medium (250 points)

---

## Dependencies

- None

## Related Issues

- #129
- #131
- #132
- #133

---

## Context

Several hooks documentation pages contain encoding corruption, broken arrows, or malformed symbols. These pages are high-traffic reference material and should read cleanly.

## What Needs to Happen

1. Scan `nextellar-docs/docs/hooks/` for corrupted characters.
2. Replace malformed text with clean readable wording.
3. Preserve code examples and technical meaning while cleaning up the prose.

## Files to Modify

- Affected files under `nextellar-docs/docs/hooks/`

## Acceptance Criteria

- [ ] Hooks docs render without visible corrupted glyphs
- [ ] Links and prose read cleanly
- [ ] MDX structure remains valid

## How to Validate

```bash
cd nextellar-docs
pnpm dev
```

Review the hooks pages in the browser after cleanup.

## PR Requirements

- PR title: `docs: fix encoding corruption in hooks documentation`
