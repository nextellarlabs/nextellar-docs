# Document `upgrade` Command

**Type:** Documentation Feature
**Labels:** `docs`, `cli`, `feature`, `difficulty:easy`
**Complexity:** Easy (100 points)

---

## Dependencies

- None

## Related Issues

- `15-document-current-scaffold-flags`
- `16-update-cli-docs-for-interactive-prompting`

---

## Context

The CLI includes an `upgrade` command for updating an existing Nextellar project, but the docs site does not currently document it.

## What Needs to Happen

1. Add documentation for `nextellar upgrade`.
2. Include `--dry-run`.
3. Include `--yes`.
4. Explain the basic intended workflow.

## Files to Modify

- `nextellar-docs/docs/cli/commands.mdx`
- `nextellar-docs/docs/cli/options.mdx`

## Acceptance Criteria

- [ ] `upgrade` is documented
- [ ] Its main options are documented
- [ ] Examples match the actual CLI syntax

## How to Validate

Use `nextellar/bin/nextellar.ts` as the source of truth.

## PR Requirements

- PR title: `docs: add upgrade command documentation`
