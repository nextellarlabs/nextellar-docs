---
title: Document the Husky pre-commit hook
description: Working draft for issue 288 covering the project's Husky pre-commit hook.
---

# Document the Husky pre-commit hook

Draft for issue #288.

The published page is `docs/guides/husky-pre-commit-hooks.mdx`.

Coverage:

- Describes `.husky/pre-commit` and the `pnpm lint-staged` command it runs.
- Documents the `lint-staged` Prettier pattern from `package.json`.
- Shows how to skip the hook with `git commit --no-verify` only when needed.
- Lists common failures and fixes.
- Points readers to the docs validation workflow for `pnpm build:content` and
  `pnpm check:links`.
