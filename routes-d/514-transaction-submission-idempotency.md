---
title: Idempotent Transaction Submission
description: How to safely retry Stellar transaction submissions without double-spending, covering sequence number handling and safe retry strategies
---

# Idempotent Transaction Submission

Stellar transactions are inherently idempotent by design — submitting the same signed transaction envelope twice produces one ledger result, not two. This property makes safe retries straightforward once you understand sequence number handling.

---

## Why Retries Are Safe

A Stellar transaction is uniquely identified by its **hash**, which is derived from the transaction envelope including the sequence number. If a submission times out or returns a network error, you can re-submit the same signed envelope and Horizon will either:

- Return the already-applied result if the transaction was already included in a ledger, or
- Apply it now if it hasn't been yet.

The sequence number is consumed exactly once regardless of how many times you submit the same envelope.

---

## Sequence Number Handling

The danger is **building a new transaction** with an old sequence number after a partial failure:

```
Account seq = 100
Build tx with seq = 101, sign → submit → network error
❌ Build NEW tx with seq = 101 → this will conflict if the first landed
✅ Re-submit the ORIGINAL signed envelope → safe
```

Always cache the signed envelope and re-submit it on retry. Only rebuild with a fresh sequence number if you have confirmed the original transaction was **not** applied.

---

## Safe Retry Strategy

```js
async function submitWithRetry(server, signedTx, maxAttempts = 5) {
  const txHash = signedTx.hash().toString('hex');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await server.submitTransaction(signedTx);
      return result; // success
    } catch (err) {
      const status = err?.response?.status;

      // Already applied — fetch and return the existing result
      if (
        status === 400 &&
        err?.response?.data?.extras?.result_codes?.transaction === 'tx_bad_seq'
      ) {
        // Sequence was consumed — check if OUR tx landed
        try {
          const existing = await server
            .transactions()
            .transaction(txHash)
            .call();
          return existing;
        } catch {
          throw err; // sequence consumed by a different transaction — must rebuild
        }
      }

      // Timeout or 5xx — safe to retry the same envelope
      if (!status || status >= 500) {
        const delay = 1000 * 2 ** (attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw err; // 4xx other than bad_seq — not retryable
    }
  }

  throw new Error(`Transaction not confirmed after ${maxAttempts} attempts`);
}
```

---

## Notes

- `tx_bad_seq` during retry means either (a) your tx landed and incremented the sequence, or (b) another transaction used that sequence slot. Distinguish by fetching the tx hash directly.
- Never rebuild with a fresh sequence number until you've confirmed the original is absent from the ledger.
- On Testnet, network resets invalidate all pending transactions — check `horizon-testnet.stellar.org/fee_stats` for liveness before debugging retries.

**Related:** [Transaction Results Shape](/routes-d/496-transaction-results-shape), [Horizon Integration](/docs/integrations/horizon)
