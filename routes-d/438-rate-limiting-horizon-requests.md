# Working Draft — Issue #438

## Add a thorough guide on rate limiting Horizon requests

**Status:** Complete  
**Target file:** `docs/guides/rate-limiting-horizon-requests.mdx`  
**Sidebar entry:** Guides → "Rate Limiting Horizon Requests"

### Scope

Documentation-only. No code changes. The guide covers:

1. Known Horizon rate limits (testnet vs mainnet, HTTP 429 response)
2. Batching strategies (cursor-based pagination, single account load vs multiple)
3. Caching patterns (in-memory, stale-while-revalidate, deduplication)
4. Retry with exponential backoff
5. Minimal TypeScript example with backoff + cache
6. Related links to existing verified pages

### Internal links used

| Link text             | Href                                | Exists? |
| --------------------- | ----------------------------------- | ------- |
| useStellarBalances    | /docs/hooks/use-stellar-balances    | ✅      |
| useTransactionHistory | /docs/hooks/use-transaction-history | ✅      |
| Stellar Horizon       | /docs/integrations/horizon          | ✅      |
| Hook Error Handling   | /docs/guides/hook-error-handling    | ✅      |
| Transaction Batching  | /docs/guides/transaction-batching   | ✅      |
| Glossary              | /docs/guides/glossary               | ✅      |

### Acceptance criteria checklist

- [x] Frontmatter matches schema: title (required), description (optional), date (optional)
- [x] All internal links verified against existing MDX files
- [x] No /docs/components/\* links
- [x] Sidebar entry added to both Guides sections in config/sidebar.tsx
- [x] pnpm check:links — only tests component sidebar links, unaffected
- [x] pnpm validate:sidebar — only checks /docs/components/\*, unaffected
