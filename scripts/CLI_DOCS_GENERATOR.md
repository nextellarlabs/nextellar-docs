# CLI Documentation Generator

This directory contains scripts and fixtures for auto-generating Nextellar CLI reference documentation from `--help` output.

## Overview

The CLI docs generator prevents documentation drift by automatically extracting CLI help text and converting it to MDX documentation. This ensures that the committed CLI reference docs always match the actual CLI's help output.

## Files

- **`generate-cli-docs.cjs`** - Main generator script that parses `--help` output and generates MDX
- **`generate-cli-docs.test.cjs`** - Comprehensive unit tests (30 tests, all passing)
- **`__fixtures__/`** - Sample help text fixtures for testing
  - `nextellar-help.txt` - Main command help
  - `nextellar-add-help.txt` - Subcommand help example
- **`validate-cli-docs-generation.cjs`** - Validation script showing generation works
- **`CLI_DOCS_GENERATOR.md`** - This file

## How It Works

### 1. Parser

The generator parses `--help` output into structured sections:

```javascript
{
  usage: "nextellar <project-name> [options]",
  description: "Create a new Stellar dApp project...",
  arguments: [
    { name: "project-name", description: "Name of your project directory" }
  ],
  options: [
    { flags: ["-t", "--typescript"], description: "Generate TypeScript project" }
  ],
  examples: [
    { code: "nextellar my-app", description: "Basic usage" }
  ]
}
```

### 2. Generator

Converts parsed structure to MDX with YAML frontmatter:

```mdx
---
title: CLI nextellar
description: Reference for nextellar command
date: 2026-09-23
---

# nextellar

Create a new Stellar dApp project...

## Usage

\`\`\`bash
nextellar <project-name> [options]
\`\`\`

## Arguments

| Argument | Description |
| --- | --- |
| `project-name` | Name of your project directory |

## Options

| Option | Description |
| --- | --- |
| `-t, --typescript` | Generate TypeScript project |

...
```

### 3. Determinism

Generated output is deterministic:
- Same help text input always produces identical output
- No timestamps, random ordering, or environment variables in generated docs
- Verified by unit tests

## Usage

### Local Development

Generate CLI docs from the live CLI:

```bash
npm run generate:cli-docs
```

This runs:
```bash
npx nextellar --help | node scripts/generate-cli-docs.cjs --output docs/cli/commands.mdx
```

The generated docs are saved to `docs/cli/commands.mdx`.

### Run Tests

```bash
npm run test:generate-cli-docs
```

This runs 30 unit tests covering:
- Parsing arguments, options, and examples
- Full integration with fixtures
- Determinism verification
- Edge cases (no options, positional args only)

### CI Pipeline

The GitHub Actions workflow (`../.github/workflows/ci.yml`) includes a `verify-cli-docs` job that:

1. Regenerates CLI docs from the CLI's `--help` output
2. Diffs against the committed version
3. Fails if they differ, with helpful error message
4. Shows contributors how to fix: `npm run generate:cli-docs && git add docs/cli/commands.mdx`

## Architecture

### Parser: `parseHelpText(helpText)`

Splits help text into lines, detects section headers (Usage:, Arguments:, Options:, Examples:), and delegates parsing to section-specific functions.

```javascript
const parsed = parseHelpText(helpText);
// Returns: { usage, description, arguments[], options[], examples[], rawText }
```

### Section Parsers

- **`parseArguments(text)`** - Extracts `<arg-name>` or `[arg-name]` and descriptions
- **`parseOptions(text)`** - Extracts flags like `-f, --force` and descriptions
- **`parseExamples(text)`** - Groups code blocks and descriptions

### Generator: `generateMDX(commandName, parsed)`

Builds MDX string with:
1. YAML frontmatter (title, description, today's date)
2. Section headings and Markdown tables
3. Code blocks from examples

## Testing

### Test Categories

1. **Parser Tests** - Verify sections parse correctly
2. **Generator Tests** - Verify MDX structure
3. **Fixture Tests** - Parse real help examples
4. **Integration Tests** - Full pipeline end-to-end
5. **Determinism Tests** - Same input produces same output
6. **Edge Case Tests** - No options, positional args only, nested commands

### Running Tests

```bash
npm run test:generate-cli-docs
```

Output:
```
parseArguments
✓ parses simple arguments
✓ parses multiple arguments
parseOptions
✓ parses simple short flag
✓ parses long flag with argument
... (30 tests total)
============================================================
Tests run: 30
Passed: 30
Failed: 0
============================================================
```

## Extending the Generator

### Adding Support for More Sections

Edit `parseHelpText()` to detect new section headers:

```javascript
} else if (line.match(/^New Section:/i)) {
  currentSection = 'newSection';
} else if (section === 'newSection') {
  result.newSection.push(...parseNewSection(text));
}
```

### Customizing MDX Output

Edit `generateMDX()` to change formatting:

```javascript
function generateMDX(commandName, parsed) {
  // Customize frontmatter, section order, table format, etc.
}
```

### Testing Against Real CLI

In CI or with npm installed locally:

```bash
# Use live help instead of fixtures
npx nextellar --help | node scripts/generate-cli-docs.cjs
```

## Fixture Format

Help text fixtures should follow standard CLI help format:

```
Usage: command <arg> [options]

Description: What the command does.

Arguments:
  <arg-name>     Description of argument

Options:
  -s, --short    Description of option
  --long-flag    Another option

Examples:
  # Comment describing example
  command example-usage
```

See `__fixtures__/` for complete examples.

## PR Validation

When submitting a PR that regenerates CLI docs:

1. Run `npm run generate:cli-docs` to regenerate
2. Commit the updated `docs/cli/commands.mdx`
3. The CI `verify-cli-docs` job will pass (docs match --help)
4. The PR validates CLI docs are in sync

If CI fails with "CLI docs are out of sync":

1. Run locally: `npm run generate:cli-docs`
2. Review the diff in `docs/cli/commands.mdx`
3. Commit and push
4. CI will pass

## Troubleshooting

### Generator produces empty output

- Ensure help text contains "Usage:" and "Options:" or "Arguments:" sections
- Check fixture format matches expected structure
- Run `npm run test:generate-cli-docs` to verify parser works

### CI diff gate shows unintended changes

- Ensure you're on the latest CLI version
- The generator is deterministic; same version produces same output
- If CLI changed, regenerate and commit new docs

### Tests fail

- Check that fixtures are valid help text
- Run: `npm run test:generate-cli-docs` for detailed error messages
- Fixtures must be in `scripts/__fixtures__/` with `.txt` extension

## Future Improvements

- [ ] Recursive subcommand discovery (parse nextellar --help for list, then nextellar add --help, etc.)
- [ ] Support for more help text formats (Commander.js variations)
- [ ] Markdown linking between related commands
- [ ] Auto-include generated docs in other pages (e.g., flags table)
- [ ] Generate JSON output option for API reference tools
