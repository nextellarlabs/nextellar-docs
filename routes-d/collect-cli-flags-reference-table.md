# Issue — Collect all CLI flags into one reference table

Working draft for the docs change requested in issue: collect every Nextellar CLI flag into a single reference table.

## Planned doc location

- `docs/cli/flags.mdx`

## Scope

- Consolidate all CLI flags into one table
- Group flags by related categories
- Include default values where relevant
- Preserve the existing MDX frontmatter and docs style

## Acceptance criteria

- Content builds with `pnpm build:content` without errors
- Internal links pass `pnpm check:links`
- Matches existing CLI docs writing style
