# Clean Up Stale Component Page References

**Type:** Documentation Cleanup
**Labels:** `docs`, `cleanup`, `content`, `difficulty:easy`
**Complexity:** Easy (150 points)

---

## Dependencies

- Depends on `01-remove-unavailable-component-links-from-sidebar`

## Related Issues

- `06-fix-encoding-corruption-in-components-docs`

---

## Context

Some docs pages reference component pages that are not available yet, such as `BalanceCard`, `TransactionList`, or `PaymentForm`. Even after removing them from the sidebar, these stale references can still mislead readers.

## What Needs to Happen

1. Search the docs content for references to unavailable component pages.
2. Remove those links or reword them so they do not imply the page exists.
3. Preserve useful conceptual references where possible without linking to missing docs.

## Files to Modify

- Affected files under `nextellar-docs/docs/`

## Acceptance Criteria

- [ ] Docs content no longer links readers to missing component pages
- [ ] Useful references are retained where possible
- [ ] No broken internal component-doc links remain for removed pages

## How to Validate

```bash
cd nextellar-docs
pnpm dev
```

Manually review affected pages and click the remaining internal component links.

## PR Requirements

- PR title: `docs: clean up stale references to unavailable component pages`
