# Issue #230 — Add a complete migration guide between major versions

Working draft / decision record. Lives outside `docs/` so it does not affect the
Contentlayer build. Scope is documentation only.

## Planned doc location

- `docs/guides/migration.mdx` (new file)

## Scope

- List all breaking changes between v1 and v2
- Provide step-by-step upgrade instructions
- Include before/after code examples
- Verify guide renders correctly

## Breaking changes identified (v1 → v2)

1. `WalletProvider` prop `network` renamed to `networkPassphrase`
2. `useStellarWallet` no longer auto-fetches balances on connect — must call `fetchBalances()`
3. CLI flag `--wallets` renamed to `--wallet-adapters`
4. Hook return shape: `address` renamed to `publicKey`
5. `signAndSubmitWithSecret` moved from `useStellarWallet` to `useStellarPayment`
6. Minimum Node.js version raised from 18 to 20.18.0

## Acceptance criteria

- `pnpm build:content` passes.
- `pnpm check:links` passes.
- Guide renders correctly in the local dev server.
