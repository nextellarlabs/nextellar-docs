# Draft: Issue #204 — Link Validation Scripts

## File created

`docs/guides/link-validation.mdx`

## Sidebar entry added

`config/sidebar.tsx` — Guides section, title "Link Validation", href `/docs/guides/link-validation`

## Scripts documented

- `scripts/validate-sidebar.cjs` — sidebar/TOC vs filesystem check
- `scripts/check-links.cjs` — live HTTP link check against dev server
- `scripts/final-validation.cjs` — PR acceptance criteria summary

## Checklist

- [x] Describes each script and what it checks
- [x] Shows how to run each script
- [x] Explains how to read the output (with annotated examples)
- [x] Includes recommended workflow section
- [x] Frontmatter includes `title` and `description`
- [ ] `pnpm build:content` passes
- [ ] `pnpm check:links` passes
