# Issue #169 — Add descriptive titles to all external links

Working draft / decision record. Lives outside `docs/` so it does not affect the
Contentlayer build. Scope is documentation only.

## Planned changes

All fixes are applied directly to existing files in `docs/`. No new files are
created for this issue.

## Scope

Find external links that use raw URLs as the visible link text and replace them
with short, descriptive labels. Destinations are not changed.

## Audit result

The following raw-URL-as-text occurrences were found in `docs/`:

| File                                   | Line | Before                                                                             | After                            |
| -------------------------------------- | ---- | ---------------------------------------------------------------------------------- | -------------------------------- |
| `docs/guides/internationalization.mdx` | 202  | `https://nextjs.org/docs/advanced-features/i18n-routing`                           | `Next.js i18n Routing`           |
| `docs/guides/internationalization.mdx` | 203  | `https://mdxjs.com/guides/internationalization/`                                   | `MDX Internationalization Guide` |
| `docs/guides/internationalization.mdx` | 204  | `https://contentlayer.dev/docs/reference/source-files/define-document-type#locale` | `Contentlayer Locale Support`    |
| `docs/guides/internationalization.mdx` | 205  | `https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html`                | `WCAG 2.1 – Language of Page`    |

All other `https://` occurrences in `docs/` are:

- Inside fenced code blocks (not prose links — unchanged).
- Already wrapped in descriptive Markdown link syntax, e.g. `[Report an issue](https://github.com/...)`.
- Template literals inside JSX (`href={\`...\`}`) — not prose links.

## Acceptance criteria

- `pnpm build:content` passes.
- `pnpm check:links` passes.
- No URL-as-text links remain in prose outside of code blocks.
