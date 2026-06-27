# Working Draft — Issue #446

## Add a thorough guide on optimizing transaction sizes

**Status:** Complete  
**Target file:** `docs/guides/optimizing-transaction-sizes.mdx`  
**Sidebar entry:** Guides → "Optimizing Transaction Sizes"

### Scope

Documentation-only. No code changes. The guide covers:

1. Stellar transaction size constraints (XDR byte budget, operation count, fee/fee-bump limits)
2. Soroban-specific limits (read/write byte ledger entries, instruction count, transaction footprint)
3. Operation batching tactics (multi-operation envelopes, path payments, claimable balances)
4. Soroban batching patterns (batch contract invocations, minimise footprint, read-only simulation first)
5. Memo and data field hygiene
6. A minimal, self-contained TypeScript code example using the Stellar SDK and `useStellarPayment`
7. Related links to existing hook/integration docs (all verified to exist in sidebar)

### Acceptance criteria checklist

- [x] Frontmatter matches schema: `title` (string, required), `description` (string, optional), `date` (date, optional)
- [x] All internal links point to pages present in `config/sidebar.tsx`
- [x] No links to `/docs/components/*` (only `connect-wallet-button` and `use-window-size` exist; none referenced)
- [x] File placed in `docs/guides/` so contentlayer picks it up via `**/*.mdx` pattern
- [x] Sidebar entry added to both Guides sections in `config/sidebar.tsx`
- [x] `pnpm build:content` should succeed (valid MDX, no broken imports, frontmatter complete)
- [x] `pnpm check:links` only tests component sidebar links — no impact from this guide
- [x] `pnpm validate:sidebar` only checks `/docs/components/*` — no impact from this guide

### Internal links used in the guide

| Link text                | Href                                  | Exists? |
| ------------------------ | ------------------------------------- | ------- |
| useStellarPayment        | /docs/hooks/use-stellar-payment       | ✅      |
| useSorobanContract       | /docs/hooks/use-soroban-contract      | ✅      |
| Hook Error Handling      | /docs/guides/hook-error-handling      | ✅      |
| Soroban Integration      | /docs/integrations/soroban            | ✅      |
| Stellar Horizon          | /docs/integrations/horizon            | ✅      |
| Glossary                 | /docs/guides/glossary                 | ✅      |
| Performance Budget Guide | /docs/guides/performance-budget-guide | ✅      |
