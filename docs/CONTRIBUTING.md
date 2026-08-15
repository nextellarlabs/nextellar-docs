# Contributing Guide

Thank you for contributing to the documentation. This guide explains the
workflow and quality bar for changes.

## Getting started

```bash
# Install dependencies
npm install

# Run the local dev server
npm run dev

# Run the lint checks
npm run lint
```

## Workflow

1. Open an issue describing the documentation gap or correction, or find an
   existing issue to work on.
2. Create a branch from `main`.
3. Make the smallest change that addresses the issue.
4. Run the lint and link checks locally.
5. Open a pull request and reference the issue.

## Quality bar

Every change must satisfy:

1. **Accuracy** — the documented behavior matches the implementation. Verify
   against `src/lib/` and `src/templates/` rather than assuming.
2. **Completeness** — a documented feature includes its flags, environment
   variables, and config keys where relevant.
3. **Consistency** — terminology and formatting match surrounding pages.
4. **Correct links** — internal links resolve; code fences are closed and
   language-tagged.

## Common pitfalls

- **Invented variables.** Do not document a variable that does not appear in
  any template `.env.example` or in the CLI source.
- **Wrong names.** Double-check exact casing and prefixes (for example
  `NEXT_PUBLIC_SOROBAN_URL`, not `NEXT_PUBLIC_SOROBAN_RPC`).
- **Stale references.** When renaming a variable, update every page that
  references it, not just one.
- **Broken fences.** Unclosed code fences break rendering for the rest of the
  page.

## Commit conventions

- Sign off every commit (`git commit -s`).
- Use a `docs:` or `fix:` prefix matching the change type.
- Reference the issue number in the PR description.

## Review expectations

Reviewers check accuracy against the implementation first, then formatting and
links. A PR that corrects an invented or wrong variable is high-value; a PR
that only reformats is low-value and may be deferred.

## Style

- Prefer plain, active voice.
- Keep code examples minimal and runnable where possible.
- Use sentence case for headings.
