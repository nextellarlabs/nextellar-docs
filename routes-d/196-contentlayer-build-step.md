# Issue #196 — Document the contentlayer build step for contributors

Working draft for the docs change requested in issue #196.

## Planned doc location

- `docs/guides/contributing.mdx` (new file)

## Scope

- Explain what the content build step does
- Show the command to run it
- Note when it must run
- Help contributors understand the pipeline

## Content Build Process

### What it does

- Processes MDX files into structured data
- Validates frontmatter and content structure
- Generates type-safe content objects
- Creates navigation and search indices

### Command

```bash
pnpm build:content
```

### When to run

- After adding new MDX files
- After modifying frontmatter
- Before running the development server
- As part of the full build process

### Integration

- Runs automatically during `pnpm build`
- Required for proper content rendering
- Validates content structure and links

## Acceptance Criteria

- Content builds with `pnpm build:content` without errors
- Internal links pass `pnpm check:links`
- Matches existing MDX frontmatter and writing style
