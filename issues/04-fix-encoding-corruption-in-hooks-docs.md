# Fix Encoding Corruption in Hooks Docs

**Type:** Documentation Bug Fix
**Labels:** `docs`, `bug`, `hooks`, `content`, `difficulty:medium`
**Complexity:** Medium (200 points)

---

## Dependencies

- None

## Related Issues

- `03-fix-encoding-corruption-in-readme`
- `05-fix-encoding-corruption-in-integrations-docs`
- `06-fix-encoding-corruption-in-components-docs`
- `07-fix-encoding-corruption-in-getting-started-and-index-pages`

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
