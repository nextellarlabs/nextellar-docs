# Document `deploy` Command

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

The CLI includes a `deploy` command for validating and preparing a deployment bundle, but this command is not currently documented on the website.

## What Needs to Happen

1. Add documentation for `nextellar deploy`.
2. Include `--dry-run`.
3. Explain the command at a high level and when it should be used.

## Files to Modify

- `nextellar-docs/docs/cli/commands.mdx`
- `nextellar-docs/docs/cli/options.mdx`

## Acceptance Criteria

- [ ] `deploy` is documented
- [ ] `deploy --dry-run` is documented
- [ ] Examples match the current CLI syntax

## How to Validate

Use `nextellar/bin/nextellar.ts` as the source of truth.

## PR Requirements

- PR title: `docs: add deploy command documentation`
