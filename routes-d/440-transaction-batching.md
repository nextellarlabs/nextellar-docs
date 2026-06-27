# Working Draft — Issue #440

## Add a comprehensive guide on transaction batching

**Status:** Complete  
**Target file:** `docs/guides/transaction-batching.mdx`  
**Sidebar entry:** Guides → "Transaction Batching"

### Scope

Documentation-only. No code changes. The guide covers:

1. What batching is and why it matters (fee savings, atomicity, throughput)
2. Use cases: multi-asset distribution, trustline + payment, account setup, multi-hop DEX
3. Limits: 100 ops/tx, XDR size, fee scaling, signer count
4. Construction and signing walkthrough with `TransactionBuilder`
5. Soroban batching via contract-level batch entry points
6. A minimal self-contained TypeScript example (trustline + payment in one envelope)
7. Error handling for batch failures
8. Related links to existing verified pages

### Internal links used

| Link text                    | Href                                      | Exists? |
| ---------------------------- | ----------------------------------------- | ------- |
| useStellarPayment            | /docs/hooks/use-stellar-payment           | ✅      |
| useSorobanContract           | /docs/hooks/use-soroban-contract          | ✅      |
| Hook Error Handling          | /docs/guides/hook-error-handling          | ✅      |
| Soroban Integration          | /docs/integrations/soroban                | ✅      |
| Stellar Horizon              | /docs/integrations/horizon                | ✅      |
| Glossary                     | /docs/guides/glossary                     | ✅      |
| Optimizing Transaction Sizes | /docs/guides/optimizing-transaction-sizes | ✅      |

### Acceptance criteria checklist

- [x] Frontmatter matches schema: `title` (required), `description` (optional), `date` (optional)
- [x] All internal links verified against existing MDX files
- [x] No `/docs/components/*` links (only connect-wallet-button and use-window-size exist)
- [x] Sidebar entry added to both Guides sections in `config/sidebar.tsx`
- [x] `pnpm build:content` — valid MDX, no JSX tag mismatches, frontmatter complete
- [x] `pnpm check:links` — only tests component sidebar links, unaffected
- [x] `pnpm validate:sidebar` — only checks `/docs/components/*`, unaffected
