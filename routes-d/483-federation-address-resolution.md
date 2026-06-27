---
title: Federation Address Resolution
description: How to resolve a Stellar federation address to an account ID, with caching considerations and a working example
---

# Federation Address Resolution

A Stellar federation address (e.g. `alice*example.com`) maps to a full public key via a two-step lookup. Resolving it before payment lets users share readable addresses instead of 56-character keys.

---

## Resolution Flow

1. Fetch `https://example.com/.well-known/stellar.toml`.
2. Read the `FEDERATION_SERVER` URL from the TOML file.
3. Query `GET <FEDERATION_SERVER>?q=alice*example.com&type=name`.
4. Parse the `account_id` from the JSON response.

```js
import { Federation, StellarToml } from '@stellar/stellar-sdk';

async function resolveAddress(federatedAddress) {
  // The SDK handles the full two-step lookup
  const result = await Federation.Server.resolve(federatedAddress);
  return result.account_id; // the public key
}

// Usage
const publicKey = await resolveAddress('alice*example.com');
```

The Stellar SDK's `Federation.Server.resolve` performs both steps automatically.

---

## Caching Considerations

- **Cache the result per address.** The public key for a given federated address rarely changes; re-resolving on every payment adds unnecessary latency and load on the federation server.
- **Respect TTL.** The stellar.toml and federation server responses may include HTTP `Cache-Control` headers — honour them.
- **Invalidate on failure.** If a payment to a cached key fails with `op_no_destination`, the account may have been deleted; evict the cache entry and re-resolve.
- **Do not cache indefinitely.** A reasonable TTL is 5–30 minutes for user-facing flows; longer for batch jobs where addresses are unlikely to change mid-run.

```js
const cache = new Map();

async function resolveWithCache(federatedAddress, ttlMs = 10 * 60 * 1000) {
  const cached = cache.get(federatedAddress);
  if (cached && Date.now() - cached.ts < ttlMs) return cached.accountId;

  const result = await Federation.Server.resolve(federatedAddress);
  cache.set(federatedAddress, { accountId: result.account_id, ts: Date.now() });
  return result.account_id;
}
```

---

## Notes

- Not all Stellar public keys have federation addresses; only resolve when the user provides a `*`-containing string.
- The `memo` and `memo_type` fields in the federation response, if present, must be included in the payment transaction.

**Related:** [Glossary: Federation](/routes-d/459-glossary-federation-sequence-number), [Horizon Integration](/docs/integrations/horizon)
