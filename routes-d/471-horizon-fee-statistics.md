---
title: Horizon Fee Statistics Endpoint
description: The Horizon fee statistics endpoint, its response fields, and how to use it to choose an appropriate transaction fee
---

# Horizon Fee Statistics Endpoint

Before submitting a transaction, you can query Horizon for current network fee statistics to choose a fee that is likely to be accepted without overpaying.

---

## Endpoint

```
GET /fee_stats
```

No parameters required.

---

## Example Response Fields

```json
{
  "last_ledger": "51234567",
  "last_ledger_base_fee": "100",
  "ledger_capacity_usage": "0.42",
  "fee_charged": {
    "max": "1000",
    "min": "100",
    "mode": "100",
    "p10": "100",
    "p20": "100",
    "p50": "100",
    "p80": "200",
    "p95": "500",
    "p99": "1000"
  },
  "max_fee": {
    "max": "10000",
    "min": "100",
    "mode": "100",
    "p10": "100",
    "p20": "100",
    "p50": "200",
    "p80": "500",
    "p95": "1000",
    "p99": "5000"
  }
}
```

| Field                   | Description                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| `last_ledger_base_fee`  | Minimum fee in stroops per operation for the last ledger              |
| `ledger_capacity_usage` | 0–1 fill ratio; values above ~0.5 indicate surge pricing may activate |
| `fee_charged`           | Distribution of fees actually charged on recently closed ledgers      |
| `max_fee`               | Distribution of fees that submitters offered (bids)                   |

---

## How to Inform Fee Choice

```js
import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon.stellar.org');

async function getRecommendedFee() {
  const stats = await server.feeStats();
  const usage = parseFloat(stats.ledger_capacity_usage);

  // Under normal load use p50 of what was charged; under surge use p95
  const feeStroops =
    usage > 0.5 ? stats.fee_charged.p95 : stats.fee_charged.p50;

  return feeStroops; // pass as `fee` to TransactionBuilder
}
```

Using `fee_charged.p50` during normal conditions minimises cost. Switching to `p95` under high load increases the chance of inclusion without guessing a ceiling.

**Related:** [Horizon Integration](/docs/integrations/horizon), [Transaction Results Shape](/routes-d/496-transaction-results-shape)
