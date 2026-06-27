---
title: Transaction Results Shape
description: The structure of transaction results returned by Horizon, envelope versus result fields, and how to parse and handle errors
---

# Transaction Results Shape

When you submit a transaction to Horizon or fetch one from the ledger, the response contains both the original transaction envelope and the on-chain result. Understanding which fields come from each side saves time when debugging.

---

## Envelope vs Result Fields

| Field             | Source   | Description                                               |
| ----------------- | -------- | --------------------------------------------------------- |
| `envelope_xdr`    | Envelope | The signed transaction as base64 XDR — what was submitted |
| `result_xdr`      | Result   | The encoded outcome after ledger application              |
| `result_meta_xdr` | Result   | Ledger entry changes caused by the transaction            |
| `fee_charged`     | Result   | Actual fee deducted in stroops                            |
| `successful`      | Result   | `true` if all operations succeeded                        |
| `id`              | Both     | Transaction hash (hex), derived from the envelope         |

The **envelope** is immutable — it is what you signed. The **result** is written by the network after applying the transaction to the ledger.

---

## Parsing Example

```js
import { Horizon, xdr } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon.stellar.org');

async function parseTransactionResult(txHash) {
  const tx = await server.transactions().transaction(txHash).call();

  // Basic outcome
  console.log('Successful:', tx.successful);
  console.log('Fee charged (stroops):', tx.fee_charged);

  // Decode the result XDR to inspect per-operation results
  const result = xdr.TransactionResult.fromXDR(tx.result_xdr, 'base64');
  const results = result.result().results();

  results.forEach((opResult, i) => {
    const code = opResult.tr().switch().name;
    console.log(`Operation ${i}: ${code}`);
  });

  return tx;
}
```

---

## Error Edges

| Scenario                          | What you see                                                         |
| --------------------------------- | -------------------------------------------------------------------- |
| Transaction not yet on ledger     | 404 from Horizon — poll again or use streaming                       |
| Fee bump wraps a failing inner tx | `successful: false`; inner `result_xdr` holds the inner result code  |
| `op_bad_auth`                     | A required signer was missing; check signers and weights             |
| `tx_bad_seq`                      | Sequence number was already consumed; reload the account and rebuild |
| `tx_insufficient_fee`             | The submitted fee was below the network's surge-pricing minimum      |

Always check `tx.successful` before trusting that operations completed. A `200 OK` from Horizon's submit endpoint only means the transaction was accepted for processing, not that every operation succeeded.

**Related:** [Horizon Integration](/docs/integrations/horizon)
