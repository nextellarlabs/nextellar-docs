# Document `add` Feature Catalog

**Type:** Documentation Feature
**Labels:** `docs`, `cli`, `feature`, `difficulty:medium`
**Complexity:** Medium (200 points)

---

## Dependencies

- Depends on `09-document-add-command`

## Related Issues

- `15-document-current-scaffold-flags`

---

## Context

The `add` command supports a feature catalog in the CLI source, but the docs site does not explain which features are available or what each one adds.

Current CLI features include:

- `wallet`
- `balances`
- `payments`
- `history`
- `trustlines`
- `defi`
- `contracts`

## What Needs to Happen

1. Add a section describing the supported `add` features.
2. Explain what each feature adds at a high level.
3. Include example commands for common use cases.

## Files to Modify

- `nextellar-docs/docs/cli/commands.mdx`
- `nextellar-docs/docs/cli/overview.mdx`
- Any related page if needed

## Acceptance Criteria

- [ ] Supported `add` features are documented
- [ ] Each feature has a short explanation
- [ ] Examples use the real feature names from the CLI source

## How to Validate

Use `nextellar/src/lib/features.ts` as the source of truth.

## PR Requirements

- PR title: `docs: document add feature catalog`
