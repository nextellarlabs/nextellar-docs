---
title: Reading Operation Results
description: How to parse operation result codes from Horizon responses and decoded XDR, with common code mappings and a worked example
---

# Reading Operation Results

When a Stellar transaction is applied to the ledger, each operation produces its own result code. Horizon surfaces these codes in two places: the structured `result_codes` object on failed submissions, and the `result_xdr` field on any settled transaction. Knowing how to read both saves time when debugging failed payments, trustline changes, and contract calls.

---

## Where Result Fields Live

| Field                 | When present              | What it contains                                                 |
| --------------------- | ------------------------- | ---------------------------------------------------------------- |
| `successful`          | Every settled transaction | `true` only if every operation succeeded                         |
| `result_xdr`          | Every settled transaction | Base64-encoded `TransactionResult` with per-operation outcomes   |
| `result_meta_xdr`     | Every settled transaction | Ledger entry changes (balances, trustlines, contract storage)    |
| `extras.result_codes` | Failed submit (`400`)     | Human-readable `transaction` and `operations` codes from Horizon |
| `fee_charged`         | Every settled transaction | Actual fee deducted in stroops                                   |

Horizon's submit endpoint returns `200 OK` when the transaction was accepted for processing — not when every operation succeeded. Always inspect `successful` and the operation-level codes before treating a transaction as complete.

---

## Reading Result Codes from Horizon

On a failed submission, Horizon includes structured codes under `extras.result_codes`:

```js
import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

async function submitAndReadCodes(signedTx) {
  try {
    const result = await server.submitTransaction(signedTx);
    console.log('Transaction hash:', result.hash);
    console.log('All operations succeeded:', result.successful);
    return result;
  } catch (err) {
    const extras = err?.response?.data?.extras;
    if (extras?.result_codes) {
      console.error('Transaction code:', extras.result_codes.transaction);
      console.error('Operation codes:', extras.result_codes.operations);
    }
    throw err;
  }
}
```

The `operations` array aligns with operation index: `operations[2]` is the result code for the third operation in the envelope.

---

## Decoding `result_xdr`

For transactions already on the ledger, decode `result_xdr` to inspect each operation's outcome:

```js
import { Horizon, xdr } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon.stellar.org');

async function readOperationResults(txHash) {
  const tx = await server.transactions().transaction(txHash).call();
  const result = xdr.TransactionResult.fromXDR(tx.result_xdr, 'base64');
  const opResults = result.result().results();

  return opResults.map((opResult, index) => {
    const tr = opResult.tr();
    const code = tr.switch().name;

    // Payment-specific detail when available
    if (code === 'payment') {
      return { index, code, detail: tr.paymentResult().switch().name };
    }

    return { index, code };
  });
}
```

Use `result_meta_xdr` when you need balance deltas or trustline changes — not just success or failure.

---

## Common Code Mappings

### Transaction-level codes

| Code                           | Meaning                       | Typical fix                  |
| ------------------------------ | ----------------------------- | ---------------------------- |
| `tx_success`                   | All operations succeeded      | None                         |
| `tx_failed`                    | At least one operation failed | Inspect `operations` array   |
| `tx_bad_seq`                   | Sequence number already used  | Reload account and rebuild   |
| `tx_insufficient_fee`          | Fee below network minimum     | Raise fee via `/fee_stats`   |
| `tx_too_early` / `tx_too_late` | Outside valid time bounds     | Adjust `minTime` / `maxTime` |
| `tx_bad_auth`                  | Missing required signature    | Check signers and weights    |

### Operation-level codes

| Code                     | Meaning                             | Typical fix                                 |
| ------------------------ | ----------------------------------- | ------------------------------------------- |
| `op_success`             | Operation applied                   | None                                        |
| `op_underfunded`         | Source balance too low              | Check available balance and reserves        |
| `op_no_trust`            | Destination lacks trustline         | Add trustline or use authorized asset       |
| `op_line_full`           | Destination trustline limit reached | Raise limit or use different account        |
| `op_low_reserve`         | Account would drop below minimum    | Leave more XLM for base reserve             |
| `op_bad_auth`            | Operation signer missing            | Add required signature                      |
| `op_not_supported`       | Operation type disabled on network  | Verify network and protocol version         |
| `op_exceeded_work_limit` | Soroban resource budget exceeded    | Reduce contract work or raise resource fees |

---

## Small Example

```js
import { Horizon, xdr } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

async function diagnosePayment(txHash) {
  const tx = await server.transactions().transaction(txHash).call();

  if (tx.successful) {
    console.log('Payment succeeded. Fee:', tx.fee_charged, 'stroops');
    return;
  }

  const result = xdr.TransactionResult.fromXDR(tx.result_xdr, 'base64');
  const txCode = result.result().switch().name;
  console.log('Transaction result:', txCode);

  result
    .result()
    .results()
    .forEach((op, i) => {
      const opCode = op.tr().switch().name;
      console.log(`Operation ${i}: ${opCode}`);
    });
}

// Usage after a failed payment attempt
await diagnosePayment('a1b2c3d4e5f6...');
```

---

## Notes

- Batch transactions fail atomically — if operation 3 fails, operations 4+ are not applied, but earlier operations in the same transaction are rolled back too.
- Fee-bump wrappers expose the inner transaction's result inside the outer `result_xdr`; decode both layers when debugging nested envelopes.
- For live dashboards, emit metrics keyed by `result_code` rather than logging full XDR on every failure.

**Related:** [Transaction Results Shape](/routes-d/496-transaction-results-shape), [XDR Encoding and Decoding](/routes-d/482-xdr-encoding-decoding), [Horizon Integration](/docs/integrations/horizon)
