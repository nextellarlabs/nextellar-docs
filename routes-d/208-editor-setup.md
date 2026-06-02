# Issue #208 — Document the recommended editor setup

Working draft for the docs change requested in issue #208.

## Planned doc location

- `docs/guides/editor-setup.mdx`

## Scope

- Suggest useful editor extensions for contributors
- Note formatting and linting integration
- Keep recommendations optional and clear
- Cover multiple editors (VS Code primary)

## Recommended Extensions

### VS Code Extensions

- **ESLint**: Automatic linting and error detection
- **Prettier**: Code formatting on save
- **MDX**: Syntax highlighting for MDX files
- **Tailwind CSS IntelliSense**: CSS class autocomplete
- **TypeScript Importer**: Auto-import management

### Editor Configuration

- Format on save settings
- ESLint integration
- Prettier configuration
- File associations for MDX

## Integration Notes

- Formatting matches project Prettier config
- Linting follows project ESLint rules
- Pre-commit hooks ensure consistency

## Acceptance Criteria

- Content builds with `pnpm build:content` without errors
- Internal links pass `pnpm check:links`
- Matches existing MDX frontmatter and writing style
