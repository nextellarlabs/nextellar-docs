# Document `telemetry` Command and Telemetry Flags

**Type:** Documentation Feature
**Labels:** `docs`, `cli`, `feature`, `difficulty:easy`
**Complexity:** Easy (100 points)

---

## Dependencies

- None

## Related Issues

- #141

---

## Context

The CLI includes telemetry controls, but the docs site does not currently explain them. This includes both the `telemetry <action>` command and the scaffold flag `--no-telemetry`.

## What Needs to Happen

1. Document `nextellar telemetry status`.
2. Document `nextellar telemetry enable`.
3. Document `nextellar telemetry disable`.
4. Document `--no-telemetry` for scaffold usage.
5. Explain the behavior at a practical level without overpromising.

## Files to Modify

- `nextellar-docs/docs/cli/commands.mdx`
- `nextellar-docs/docs/cli/flags.mdx`
- Any related telemetry or privacy reference page if needed

## Acceptance Criteria

- [ ] The `telemetry` command is documented
- [ ] `--no-telemetry` is documented
- [ ] Examples match the current CLI syntax

## How to Validate

Use `nextellar/bin/nextellar.ts` as the source of truth.

## PR Requirements

- PR title: `docs: document telemetry command and flags`
