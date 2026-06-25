---
title: Horizon Query Parameter Conventions
description: How cursor, order, and limit work across Horizon collection endpoints, with examples and pagination edge cases
---

# Horizon Query Parameter Conventions

All Horizon collection endpoints (transactions, operations, payments, effects, etc.) share a consistent set of query parameters for pagination and ordering.

---

## Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `cursor` | record paging token or `now` | none (start) | Resume from this position; `now` on streaming endpoints means start from the current tip |
| `order` | `asc` or `desc` | `asc` | Sort direction — `asc` returns oldest first, `desc` returns newest first |
| `limit` | 1–200 | 10 | Number of records per page |

---

## Examples

```js
import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon.stellar.org");

// Most recent 20 transactions for an account
const recent = await server
  .transactions()
  .forAccount(publicKey)
  .order("desc")
  .limit(20)
  .call();

// Paginate forward from a known cursor
const page2 = await server
  .transactions()
  .forAccount(publicKey)
  .order("asc")
  .cursor(recent.records[recent.records.length - 1].paging_token)
  .limit(20)
  .call();
```

The SDK also exposes `.next()` and `.prev()` on each page result for convenience:

```js
let page = await server.transactions().forAccount(publicKey).order("asc").limit(20).call();
while (page.records.length > 0) {
  // process page.records ...
  page = await page.next();
}
```

---

## Pagination Edge Cases

| Edge case | Behaviour |
|-----------|-----------|
| `cursor` points to a deleted or non-existent record | Horizon returns the next record after that position — no error |
| `limit` exceeds 200 | Horizon caps at 200 and returns at most 200 records |
| Empty page | `records` is an empty array; `next()` will also return empty — use this as the stop condition |
| `order=desc` with a `cursor` from an `asc` page | The cursor is directional — mixing directions causes unexpected results; always use a cursor from the same order direction |
| Streaming with `cursor=now` | Skips all historical records; only future events are delivered |

---

## Notes

- `paging_token` is the cursor value for each record. Store it to resume pagination after a restart.
- Prefer `order=desc` + `limit` for "latest N" queries; prefer `order=asc` + cursor-based pagination for full historical scans.

**Related:** [Transaction Results Shape](/routes-d/496-transaction-results-shape), [Latest Ledger Streaming](/routes-d/481-latest-ledger-streaming), [Horizon Integration](/docs/integrations/horizon)
