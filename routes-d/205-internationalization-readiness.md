# Issue #205 — Add a section on internationalization readiness

Working draft for the docs change requested in issue #205.

## Planned doc location

- `docs/guides/internationalization.mdx`

## Scope

- Document current limitations for translation readiness
- List steps toward translation readiness
- Note any tooling needed
- Keep it focused on documentation requirements

## Current Limitations

- All content is currently in English only
- No i18n framework integration
- Hard-coded strings in components
- No locale-specific routing
- No RTL language support

## Steps Toward Translation Readiness

1. **Content Structure**
   - Separate content from presentation
   - Use structured frontmatter for metadata
   - Implement content versioning

2. **Technical Implementation**
   - Integrate Next.js i18n routing
   - Add react-intl or next-intl
   - Extract hard-coded strings
   - Implement locale detection

3. **Tooling Requirements**
   - Translation management system (Crowdin, Lokalise)
   - Build pipeline for multiple locales
   - Content validation for translated versions

## Acceptance Criteria

- Content builds with `pnpm build:content` without errors
- Internal links pass `pnpm check:links`
- Matches existing MDX frontmatter and writing style
