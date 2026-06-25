---
title: "Note: Canonical Timestamps in Stellar"
description: The timestamp format used across Stellar APIs, including timezone expectations and a short example
---

# Canonical Timestamps in Stellar

Stellar APIs return timestamps as Unix epoch integers — seconds since 1 January 1970 00:00:00 UTC. All timestamps are in UTC; there is no timezone offset or local-time variant in the protocol.

---

## Format

| Field | Value |
|-------|-------|
| Type | Integer (Unix epoch) |
| Unit | Seconds |
| Timezone | UTC (always) |

Horizon surfaces this value on transactions, operations, and ledger records under the `created_at` field, which it returns as an ISO 8601 string for convenience. The underlying ledger stores only the raw integer.

---

## Example

```js
import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");
const tx = await server.transactions().transaction("<tx-hash>").call();

// Horizon returns ISO 8601 for created_at
console.log(tx.created_at); // "2024-06-25T11:18:36Z"

// Convert to a JS Date or Unix integer as needed
const date = new Date(tx.created_at);
const unixSeconds = Math.floor(date.getTime() / 1000);
```

---

## Notes

- Always treat timestamps as UTC. Stellar has no concept of local time zones.
- The ledger `close_time` on a `LedgerRecord` is the epoch integer directly.
- `time_bounds` in a transaction (`min_time`, `max_time`) are also Unix epoch seconds. A transaction will fail if submitted outside these bounds.
- Clock skew between your system and validator nodes can cause transactions near the bounds to fail; leave a small buffer (30–60 seconds) on both ends.

**Related:** time bounds, ledger close time, `TransactionBuilder.setTimeout`
