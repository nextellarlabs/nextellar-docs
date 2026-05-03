# Document `add` Command

**Type:** Documentation Feature
**Labels:** `docs`, `cli`, `feature`, `difficulty:medium`
**Complexity:** Medium (200 points)

---

## Dependencies

- None

## Related Issues

- #136
- #141
- #142

---

## Context

The `nextellar` CLI includes an `add [feature]` command for adding Stellar features to an existing project, but this workflow is not documented on the website.

## What Needs to Happen

1. Add documentation for `nextellar add [feature]`.
2. Explain when to use the command.
3. Document the available command options:
   - `--list`
   - `--force`
   - `--skip-install`
   - `--package-manager`

## Files to Modify

- `nextellar-docs/docs/cli/commands.mdx`
- `nextellar-docs/docs/cli/options.mdx`
- Any related CLI overview page if needed

## Acceptance Criteria

- [ ] `add` is documented on the docs site
- [ ] Its options are included
- [ ] Examples match the real CLI syntax

## How to Validate

Use `nextellar/bin/nextellar.ts` as the source of truth.

## PR Requirements

- PR title: `docs: add add-command documentation`
