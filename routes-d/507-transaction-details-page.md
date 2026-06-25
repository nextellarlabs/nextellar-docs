---
title: Building a Transaction Details Page
description: How to implement a transaction details page on Stellar, including the data shape, minimal UI code, and status badges
---

# Building a Transaction Details Page

A transaction details page lets users inspect a specific transaction — its status, fee, operations, and timestamps. This guide covers fetching the data from Horizon and rendering it with status badges.

---

## Data Shape

Fetch a single transaction by hash:

```js
import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon.stellar.org");

async function fetchTransaction(txHash) {
  const tx = await server.transactions().transaction(txHash).call();
  return tx;
}
```

Key fields on the response:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Transaction hash |
| `successful` | boolean | Whether all operations succeeded |
| `created_at` | string | ISO 8601 timestamp of ledger close |
| `fee_charged` | string | Fee in stroops |
| `operation_count` | number | Number of operations |
| `memo_type` | string | `none`, `text`, `id`, `hash`, or `return` |
| `memo` | string | Memo value if present |

---

## Minimal UI Code

```jsx
import { useState, useEffect } from "react";
import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon.stellar.org");

export function TransactionDetails({ txHash }) {
  const [tx, setTx] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    server.transactions().transaction(txHash).call()
      .then(setTx)
      .catch(setError);
  }, [txHash]);

  if (error) return <p>Transaction not found.</p>;
  if (!tx) return <p>Loading…</p>;

  return (
    <div>
      <h2>Transaction</h2>
      <StatusBadge successful={tx.successful} />
      <dl>
        <dt>Hash</dt><dd>{tx.id}</dd>
        <dt>Date</dt><dd>{new Date(tx.created_at).toLocaleString()}</dd>
        <dt>Fee</dt><dd>{(parseInt(tx.fee_charged) / 1e7).toFixed(7)} XLM</dd>
        <dt>Operations</dt><dd>{tx.operation_count}</dd>
        {tx.memo && <><dt>Memo</dt><dd>{tx.memo}</dd></>}
      </dl>
    </div>
  );
}
```

---

## Status Badges

```jsx
function StatusBadge({ successful }) {
  const style = {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: 600,
    background: successful ? "#d1fae5" : "#fee2e2",
    color: successful ? "#065f46" : "#991b1b",
  };

  return <span style={style}>{successful ? "Success" : "Failed"}</span>;
}
```

For a more detailed badge that distinguishes pending, success, and failed states:

```jsx
function TransactionStatus({ successful, ledger }) {
  if (!ledger) return <span style={{ color: "#b45309" }}>Pending</span>;
  return <StatusBadge successful={successful} />;
}
```

---

## Notes

- A transaction on Horizon always has a ledger, so `successful` is definitively `true` or `false`; pending transactions simply aren't returned yet (404).
- To list the operations within the transaction, call `server.operations().forTransaction(txHash).call()`.

**Related:** [Transaction Results Shape](/routes-d/496-transaction-results-shape), [Horizon Integration](/docs/integrations/horizon)
