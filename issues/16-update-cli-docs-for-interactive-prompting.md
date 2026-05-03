# Update CLI Docs for Interactive Prompting

**Type:** Documentation Bug Fix
**Labels:** `docs`, `cli`, `bug`, `difficulty:easy`
**Complexity:** Easy (150 points)

---

## Dependencies

- Depends on `15-document-current-scaffold-flags`

## Related Issues

- `08-document-doctor-command`
- `09-document-add-command`
- `12-document-upgrade-command`
- `13-document-deploy-command`
- `14-rewrite-template-docs-for-current-cli-support`

---

## Context

The docs currently say Nextellar is non-interactive, but the actual CLI now supports interactive prompting when running in a suitable terminal environment.

This is a product-behavior mismatch and should be corrected so the docs reflect what users actually experience.

## What Needs to Happen

1. Find pages that describe the CLI as non-interactive.
2. Replace that wording with an accurate description of the current prompting behavior.
3. Explain that prompting depends on terminal conditions and flags where appropriate.

## Files to Modify

- `nextellar-docs/docs/cli/commands.mdx`
- `nextellar-docs/docs/cli/overview.mdx`
- Any other CLI page with outdated wording

## Acceptance Criteria

- [ ] The docs no longer claim the CLI is strictly non-interactive
- [ ] Prompting behavior is described accurately at a high level
- [ ] The wording stays consistent across CLI docs pages

## How to Validate

Use `nextellar/bin/nextellar.ts` as the source of truth.

## PR Requirements

- PR title: `docs: update CLI docs for interactive prompting`
