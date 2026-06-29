---
title: Caching Common Horizon Reads
description: Strategies for safely caching Horizon API responses, which queries are safe to cache, when to invalidate, and a practical JavaScript example
---

# Caching Common Horizon Reads

Many Stellar applications query Horizon repeatedly for the same data. Caching those responses reduces latency and shields your app from Horizon rate limits without sacrificing correctness — as long as you cache only the right queries and invalidate at the right time.

---

## Which Queries Are Safe to Cache

| Query | Safe to Cache? | Notes |
|---|---|---|
| Account details (`/accounts/{id}`) | ✅ Yes | Sequence number changes on every transaction; treat that field as volatile |
| Asset stats (`/assets?asset_code=…`) | ✅ Yes | Slowly changing; 60 s TTL is fine for most UIs |
| Offer book (`/order_book`) | ⚠️ Short TTL | Prices change continuously; cache for 3–10 s only |
| Latest ledger (`/ledgers?order=desc&limit=1`) | ⚠️ Short TTL | New ledger every ~5 s; cache ≤ 5 s |
| Specific ledger by sequence | ✅ Yes | Immutable once closed; cache indefinitely |
| Specific transaction by hash | ✅ Yes | Immutable; cache indefinitely |
| Operations / payments for a closed ledger | ✅ Yes | Immutable; cache indefinitely |
| Streaming SSE endpoints | ❌ No | These push live events; caching defeats the purpose |

---

## Invalidation Triggers

- **Account sequence number** — invalidate whenever you submit a transaction for that account or receive a `transaction` SSE event for it.
- **Order book / ticker data** — use a time-based TTL (3–10 s).
- **Asset stats** — time-based TTL (60 s); also invalidate when you observe a `trustline_created` or `trustline_removed` payment effect for an asset you track.
- **Latest ledger** — time-based TTL equal to target ledger close time (5 s on mainnet).

---

## Example: Simple In-Memory Cache

```js
import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon.stellar.org");

const cache = new Map(); // key → { data, expiresAt }

function setCache(key, data, ttlMs) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

function getCache(key) {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

// Fetch account with a 30-second cache (exclude volatile sequence number use-cases)
async function fetchAccount(publicKey) {
  const cacheKey = `account:${publicKey}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const account = await server.loadAccount(publicKey);
  setCache(cacheKey, account, 30_000);
  return account;
}

// Fetch a specific (immutable) transaction — cache forever in this session
async function fetchTransaction(hash) {
  const cacheKey = `tx:${hash}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const tx = await server.transactions().transaction(hash).call();
  setCache(cacheKey, tx, Infinity); // immutable
  return tx;
}

// Fetch latest ledger with a 5-second TTL
async function fetchLatestLedger() {
  const cacheKey = "latest_ledger";
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const page = await server.ledgers().order("desc").limit(1).call();
  const ledger = page.records[0];
  setCache(cacheKey, ledger, 5_000);
  return ledger;
}
```

---

## Notes

- **Never cache sequence numbers for signing** — always call `loadAccount` fresh before building and submitting a transaction; a stale sequence number will cause the transaction to fail with `txBAD_SEQ`.
- **Use ETags where available** — Horizon includes `ETag` and `Last-Modified` headers on cacheable responses. Pass `If-None-Match` / `If-Modified-Since` on repeat requests to save bandwidth even when your TTL has expired.
- **Scope the cache to the user session** — avoid leaking one user's account state into another's view in multi-user server-side apps.

**Related:** [Horizon Query Parameter Conventions](/routes-d/508-horizon-query-parameters), [Latest Ledger Streaming](/routes-d/481-latest-ledger-streaming), [Resilient Transaction Submission](/routes-d/513-resilient-transaction-submission)
