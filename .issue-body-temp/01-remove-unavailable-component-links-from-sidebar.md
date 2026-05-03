# Remove Unavailable Component Links from Sidebar

**Type:** Documentation Cleanup
**Labels:** `docs`, `cleanup`, `navigation`, `difficulty:easy`
**Complexity:** Easy (100 points)

---

## Dependencies

- None

## Related Issues

- #128

---

## Context

The docs sidebar currently links to component documentation pages that do not exist yet. This creates dead navigation paths and makes the docs feel incomplete.

The affected entries live in `nextellar-docs/config/sidebar.tsx` under the `Components` section.

## What Needs to Happen

1. Remove sidebar entries for unavailable component docs pages.
2. Keep only component pages that actually exist in `nextellar-docs/docs/components`.
3. Make sure the `Components` group still reads clearly after cleanup.

## Files to Modify

- `nextellar-docs/config/sidebar.tsx`

## Acceptance Criteria

- [ ] The sidebar no longer links to unavailable component pages
- [ ] Every component link in the sidebar resolves to a real docs page
- [ ] The `Components` section remains clean and understandable

## How to Validate

```bash
cd nextellar-docs
pnpm dev
```

Verify each component link in the sidebar opens an existing page.

## PR Requirements

- PR title: `docs: remove unavailable component links from sidebar`
