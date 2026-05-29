# Issue #216 — Add full internationalization support to the docs

Working draft for the docs change requested in issue #216.

## Planned doc location

- `docs/guides/internationalization.mdx`

## Scope

- Outline the i18n architecture needed for docs support.
- Document how to add a new locale end to end.
- Include a sample translated page and the expected content structure.
- Explain the build and validation steps for localized docs.

## Validation

- `pnpm build:content`
- `pnpm check:links`
- Manual review of the locale workflow and example page

