# Issue #246 — Build an automated stale-content detection workflow

Working draft for the docs change requested in issue #246.

## Planned doc location

- `docs/guides/stale-content-detection.mdx`

## Scope

- Define what counts as stale documentation content.
- Describe how the detection workflow runs in local development and CI.
- Explain how to triage and prioritize reported stale content.
- Document the checks needed to keep the workflow reproducible.

## Validation

- `pnpm build:content`
- `pnpm check:links`
- Manual review of the documented workflow steps

