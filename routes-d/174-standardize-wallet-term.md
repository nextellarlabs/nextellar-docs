# Issue #174 — Standardize the use of the term "wallet" across docs

Working draft / decision record. Lives outside `docs/` so it does not affect the
Contentlayer build. Scope is documentation only.

## Decision

Use **wallet** (lowercase) as the canonical form in all running prose.

Rationale: the glossary already defines it this way ("A tool such as Freighter or
xBull that lets users connect an account and sign Stellar transactions."), and
lowercase is consistent with how "testnet" and "mainnet" are treated.

## Exceptions that are correct and must not be changed

- `Wallet` when it starts a sentence.
- `WalletProvider`, `WalletConnectButton`, `WalletNetwork`, `useWallet` — these
  are TypeScript identifiers, component names, or prop names and are PascalCase
  or camelCase by convention.
- `StellarWalletsKit` — third-party library name.
- Proper product names: `Freighter`, `Albedo`, `Lobstr`, `xBull`, `Hana`.
- Table headers (e.g. `| Wallet | Type |`) — title case is acceptable there.
- Quoted material or UI button labels (e.g. "Connect Wallet" button label).

## Audit result

A full scan of `docs/` for the word `Wallet` (capital W in mid-sentence prose)
found:

| File                              | Line    | Occurrence                                          | Action                            |
| --------------------------------- | ------- | --------------------------------------------------- | --------------------------------- |
| `docs/sdk/wallet-integration.mdx` | 6       | `# Wallet Integration` (heading)                    | Keep — headings use title case    |
| `docs/sdk/wallet-integration.mdx` | 8       | prose: "This guide covers **wallet** configuration" | Already lowercase ✅              |
| All hook files                    | various | mid-sentence `wallet` references                    | Already lowercase ✅              |
| `docs/guides/glossary.mdx`        | 94      | `### Wallet` (glossary heading)                     | Keep — it is a term being defined |

**Finding**: after a thorough scan, mid-sentence prose uses lowercase `wallet`
consistently throughout `docs/`. No mass replacement is needed. The term is
already standardized.

## Acceptance criteria

- `pnpm build:content` passes (no content changes required).
- `pnpm check:links` passes.
- Any future docs additions should use lowercase `wallet` in prose per this record.
