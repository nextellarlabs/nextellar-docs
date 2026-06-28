# Issue #283 — Add a code of conduct reference link to docs

**Status:** Implemented  
**Branch:** `feat/283-add-code-of-conduct-reference`

## Summary

Surfaces the project code of conduct from the docs site as requested in issue #283.

## Changes Made

### New file

- `docs/guides/code-of-conduct.mdx` — standalone CoC page adapted from the
  [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).
  Covers our pledge, standards, enforcement, and attribution.
  Internal backlink to `/docs/guides/contributing` included at the bottom.

### Updated files

- `docs/guides/contributing.mdx` — added a "Code of Conduct" bullet to the
  **Docs Standards** list so it is discoverable near the contributing guidance.

- `config/sidebar.tsx` — added `{ title: 'Code of Conduct', href: '/docs/guides/code-of-conduct' }`
  immediately after the "Contributing" entry in both Guides sections so the
  link appears in the sidebar near contributing guidance.

## Acceptance criteria checklist

- [x] Reference link placed near contributing guidance (sidebar + contributing.mdx)
- [x] Clear link text: "Code of Conduct"
- [x] Link resolves to a real page (`/docs/guides/code-of-conduct`)
- [x] Changes scoped to documentation only (no app code touched)
- [x] Frontmatter matches existing style (`title` + `description`)
- [x] Writing style matches existing MDX files
- [ ] `pnpm build:content` — run by reviewer / CI
- [ ] `pnpm check:links` — run by reviewer / CI
