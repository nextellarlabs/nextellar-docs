# Issue — Add a New Docs Page Walkthrough

Working draft for documenting how to add a new documentation page, including file creation, frontmatter, sidebar registration, and validation.

## Planned doc location

- `docs/guides/add-docs-page.mdx`

## Scope

- Explain where to create new docs files
- Show required MDX frontmatter
- Demonstrate how to register the page in `config/sidebar.tsx`
- Include the content build and validation commands
- Provide a minimal example that can be verified with project tooling

## Minimal example

1. Create a new file:
   - `docs/guides/add-docs-page.mdx`
2. Add frontmatter:
   - `title`
   - `description`
3. Add the sidebar entry:
   - `{ title: 'Add a Docs Page', href: '/docs/guides/add-docs-page' }`
4. Run validation:
   - `pnpm build:content`
   - `pnpm check:links`
   - `pnpm validate:sidebar`

## Acceptance criteria

- Content builds with `pnpm build:content` without errors
- Internal links pass `pnpm check:links`
- Sidebar registration is accurate for the new page
- Draft is stored in `routes-d/`
- Matches the existing MDX frontmatter and writing style
