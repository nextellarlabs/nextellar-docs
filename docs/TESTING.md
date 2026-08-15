# Testing Documentation Changes

This guide describes how to validate changes to the documentation site before
opening a pull request.

## Scope of testing

Documentation changes are validated on three axes:

1. **Structural validity** — Markdown/MDX syntax must parse cleanly and render
   correctly.
2. **Factual accuracy** — every documented CLI flag, environment variable, and
   template field must match the actual implementation in `src/`.
3. **Cross-reference integrity** — internal links and code fences must not be
   broken.

## Local checks

### Markdown lint

Install and run `markdownlint` to catch structural issues:

```bash
npm install -g markdownlint-cli
markdownlint '**/*.md' '**/*.mdx'
```

Common rules that are intentionally relaxed in CI:

- `MD013` (line length) — prose tables and long URLs frequently exceed it.
- `MD033` (inline HTML) — MDX components legitimately use inline elements.

### Environment variable cross-check

The most error-prone part of the docs is the environment variable reference.
Diff every documented variable against the real sources:

```bash
# Template defaults
grep -rhoE '^[A-Z0-9_]+=' src/templates/ | sort -u

# CLI source
grep -rhoE 'process\.env\.[A-Z0-9_]+' src/lib/ | sort -u
```

Remove any documented variable that does not appear in either source, and add
any variable that exists in the source but is missing from the docs.

### Link check

If a link checker is available, run it against the built site to catch broken
internal anchors:

```bash
npx linkinator _site --recurse --silent
```

## Writing accurate docs

- Prefer the real variable name over a plausible one. For example the URL
  variable is `NEXT_PUBLIC_SOROBAN_URL`, not `NEXT_PUBLIC_SOROBAN_RPC`.
- Never document a variable that is not present in any template `.env.example`
  or in the CLI source.
- Document `config.json` keys the same way: verify the key exists in the
  scaffold code before writing it down.
- Keep code fences closed and language-tagged so the renderer can highlight
  them correctly.
