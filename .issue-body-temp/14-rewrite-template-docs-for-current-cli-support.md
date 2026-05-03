# Rewrite Template Docs for Current CLI Support

**Type:** Documentation Bug Fix
**Labels:** `docs`, `cli`, `bug`, `templates`, `difficulty:medium`
**Complexity:** Medium (250 points)

---

## Dependencies

- Depends on #141

## Related Issues

- #142

---

## Context

The current templates documentation is out of date. It still describes `--example` usage and says official templates are not yet available, while the real CLI now supports `--template` with actual shipped templates.

## What Needs to Happen

1. Replace outdated `--example` references with the current `--template` model where appropriate.
2. Update the templates docs to reflect the currently supported templates:
   - `default`
   - `minimal`
   - `defi`
3. Include real usage examples.
4. Remove placeholder language that says templates are unavailable.

## Files to Modify

- `nextellar-docs/docs/cli/templates.mdx`
- `nextellar-docs/docs/cli/flags.mdx`
- Any other CLI docs page with outdated template wording

## Acceptance Criteria

- [ ] Template docs reflect the real CLI behavior
- [ ] `--example` is no longer described as the active template selection flow
- [ ] The supported templates are listed correctly

## How to Validate

Use `nextellar/bin/nextellar.ts` as the source of truth.

## PR Requirements

- PR title: `docs: rewrite template docs for current CLI support`
