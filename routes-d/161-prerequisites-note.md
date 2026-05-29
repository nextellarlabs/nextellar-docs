# Issue #161 — Add a short prerequisites note to the installation page

Working draft for the docs change requested in issue #161.

## Planned doc location

- `docs/getting-started/installation.mdx`

## Scope

- Add a concise prerequisites section near the top of the installation page
- List required tools with minimum versions
- Keep it brief — 3–5 bullet points maximum

## Draft content

Place this block immediately after the page heading, before the Quick Install section:

```mdx
## Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Minimum version | Notes |
|------|----------------|-------|
| **Node.js** | 20.18.0 | [Download](https://nodejs.org/) |
| **npm / yarn / pnpm** | npm 9+ | Included with Node.js |
| **Git** | any recent | Optional but recommended |

Verify your Node version:

```bash
node --version  # should print v20.18.0 or higher
```
```

## Notes

- The installation page already has a partial Prerequisites section — this draft
  proposes tightening it into a scannable table so readers can check requirements
  at a glance before running any commands.
- No changes required outside `installation.mdx`.
