# Document `doctor` Command

**Type:** Documentation Feature
**Labels:** `docs`, `cli`, `feature`, `difficulty:easy`
**Complexity:** Easy (100 points)

---

## Dependencies

- None

## Related Issues

- #141
- #142

---

## Context

The `nextellar` CLI now includes a `doctor` command for environment diagnostics, but the documentation website does not currently document it.

## What Needs to Happen

1. Add documentation for `nextellar doctor`.
2. Explain what it checks at a high level.
3. Include usage examples for standard output and JSON output.

## Files to Modify

- `nextellar-docs/docs/cli/commands.mdx`
- Any related CLI reference page if needed

## Acceptance Criteria

- [ ] `doctor` is documented on the docs site
- [ ] `doctor --json` is included
- [ ] Examples match the real CLI syntax

## How to Validate

Use `nextellar/bin/nextellar.ts` as the source of truth for the command surface.

## PR Requirements

- PR title: `docs: add doctor command documentation`
