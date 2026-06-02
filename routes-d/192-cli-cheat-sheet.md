# Issue #192 — Create a cheat sheet for common CLI commands

Working draft for the docs change requested in issue #192.

## Planned doc location

- `docs/cli/cheat-sheet.mdx`

## Scope

- List the most used CLI commands
- Add one-line descriptions for each
- Group commands by task/category
- Create a quick reference page

## Command Categories

### Project Creation

- `nextellar <name>` - Create new Stellar dApp
- `nextellar <name> --skip-install` - Create without installing deps

### Development

- `npm run dev` - Start development server
- `pnpm build:content` - Build content layer
- `pnpm check:links` - Validate internal links

### Feature Management

- `nextellar add --list` - List available features
- `nextellar add <feature>` - Add feature to project

### Deployment

- `nextellar deploy` - Prepare for production
- `nextellar deploy --dry-run` - Validate without deploying

### Help & Info

- `nextellar --help` - Show help information
- `nextellar --version` - Show CLI version

## Acceptance Criteria

- Content builds with `pnpm build:content` without errors
- Internal links pass `pnpm check:links`
- Matches existing MDX frontmatter and writing style
