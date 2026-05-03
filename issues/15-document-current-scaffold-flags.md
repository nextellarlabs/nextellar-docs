# Document Current Scaffold Flags

**Type:** Documentation Feature
**Labels:** `docs`, `cli`, `feature`, `difficulty:medium`
**Complexity:** Medium (200 points)

---

## Dependencies

- None

## Related Issues

- `08-document-doctor-command`
- `09-document-add-command`
- `10-document-add-feature-catalog`
- `11-document-telemetry-command-and-flags`
- `12-document-upgrade-command`
- `13-document-deploy-command`
- `14-rewrite-template-docs-for-current-cli-support`
- `16-update-cli-docs-for-interactive-prompting`

---

## Context

The docs site does not fully document the current scaffold flag surface. Important flags like `--with-contracts`, `--force`, and parts of the updated scaffold flow are missing or underexplained.

## What Needs to Happen

1. Review the scaffold-related flags in the CLI source.
2. Update the docs to include current scaffold flags, especially:
   - `--template <name>`
   - `--with-contracts`
   - `--force`
   - `--install-timeout <ms>`
   - `--package-manager <manager>`
3. Add examples that show realistic combinations of these flags.

## Files to Modify

- `nextellar-docs/docs/cli/flags.mdx`
- `nextellar-docs/docs/cli/options.mdx`
- `nextellar-docs/docs/cli/commands.mdx`

## Acceptance Criteria

- [ ] Current scaffold flags are documented accurately
- [ ] The docs include `--with-contracts` and `--force`
- [ ] Examples reflect the actual CLI syntax

## How to Validate

Use `nextellar/bin/nextellar.ts` as the source of truth.

## PR Requirements

- PR title: `docs: document current scaffold flags`
