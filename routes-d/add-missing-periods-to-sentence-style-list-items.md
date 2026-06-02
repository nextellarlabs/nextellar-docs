# Issue — Add missing periods to sentence-style list items

Working draft / decision record. Lives outside `docs/` so it does not affect the
Contentlayer build. Scope is documentation-only, per the issue requirements.

## Summary

Some sentence-style list items across the docs lack terminal punctuation (periods).
This issue records the convention, audit notes, and proposed fixes.

## Scope and constraints

- Scope: documentation files only, primarily under `docs/`.
- Do not change short label-style list items (e.g. single-word labels or menu-style
  entries).
- Apply changes consistently within each page — either sentence-style or label-style.
- Working drafts and this decision record live in `routes-d/`.

## Proposed convention

- Sentence-style list items should end with a period.
- Short label items (single words or very short phrases used as labels) should
  remain unchanged.

## Plan

1. Audit `docs/` for sentence-style list items missing terminal punctuation.
2. Prepare per-file changes and include a brief rationale in a PR description.
3. Verify rendering and run `pnpm check:links`.

## Audit findings (auto-generated)

_This section will be populated with files and excerpts where sentence-style
list items appear to be missing terminal punctuation. Use this as a checklist for
applying edits._

### Files found by scan

- `docs/api/index.mdx` — several label-style entries that include a short
  description after a dash. These appear to be navigation-style lines that may
  not require terminal punctuation; review before changing.

- `docs/examples/payment-app.mdx` — feature-list items such as:
  - "Multi-wallet connection (Freighter, Albedo, Lobstr, xBull, Hana)"
  - "Real-time balance display"
  - "Send XLM and custom assets"
  - "Transaction history with pagination"
  - "QR code generation for receiving"
  - "Transaction status tracking"
  - "Error handling and validation"

  These read as sentence-style list items and are good candidates for adding
  terminal periods.

_Total matches found by automatic scan: 20 (representative sample included
above)._

Next steps: review each listed file and apply per-file edits in a single PR,
keeping changes documentation-only and minimal. Mark this working draft with
the files that were edited and the exact edits for traceability.

### Edits applied

- `docs/examples/payment-app.mdx` — added terminal periods to list items in
  the "What We'll Build" section: each bullet now ends with a period.

- `docs/api/index.mdx` — added periods to navigation-style bullet descriptions
  under "SDK Reference", "Hooks API", "Context API", and "CLI Reference."

- `docs/index.mdx` — added periods to feature bullets under "Why Nextellar?",
  "Production-Grade Code", and "Complete Stellar Integration."

All edits were limited to `docs/` files and this `routes-d/` draft.

## Acceptance criteria

- `pnpm build:content` completes without errors after edits.
- `pnpm check:links` passes.
- Changes reviewed and approved by a maintainer before merge.
