---
title: XDR Encoding and Decoding
description: How to encode and decode XDR values used in Stellar transactions and responses
---

# XDR Encoding and Decoding

XDR (External Data Representation) is the binary serialization format Stellar uses for transactions, operations, ledger entries, and results. Horizon returns XDR fields as base64 strings; the Stellar SDK provides helpers to decode them.

---

## Decode Helpers

```js
import { xdr, TransactionEnvelope } from '@stellar/stellar-sdk';

// Decode a transaction envelope from base64 XDR
function decodeEnvelope(envelopeXdr) {
  return xdr.TransactionEnvelope.fromXDR(envelopeXdr, 'base64');
}

// Decode a transaction result
function decodeResult(resultXdr) {
  return xdr.TransactionResult.fromXDR(resultXdr, 'base64');
}

// Decode result meta (ledger entry changes)
function decodeMeta(metaXdr) {
  return xdr.TransactionMeta.fromXDR(metaXdr, 'base64');
}
```

---

## Encode Helpers

```js
// Encode a built transaction back to base64 XDR (for signing or storage)
function encodeTransaction(transaction) {
  return transaction.toEnvelope().toXDR('base64');
}

// Round-trip: decode then re-encode to verify integrity
function roundTrip(envelopeXdr) {
  const decoded = xdr.TransactionEnvelope.fromXDR(envelopeXdr, 'base64');
  return decoded.toXDR('base64');
}
```

---

## Small Example

```js
import { Horizon, xdr } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon.stellar.org');

async function inspectTransaction(txHash) {
  const tx = await server.transactions().transaction(txHash).call();

  // Decode result to check per-operation outcomes
  const result = xdr.TransactionResult.fromXDR(tx.result_xdr, 'base64');
  const opResults = result.result().results();

  opResults.forEach((op, i) => {
    console.log(`Op ${i}:`, op.tr().switch().name);
  });
}
```

---

## Common Pitfalls

| Pitfall                   | Cause                                              | Fix                                                                                                              |
| ------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `UnknownError` on decode  | Wrong XDR type used (e.g. decoding meta as result) | Match the XDR class to the field name: `result_xdr` → `TransactionResult`, `result_meta_xdr` → `TransactionMeta` |
| `Invalid base64`          | Extra whitespace or newlines in the string         | Call `.trim()` before decoding                                                                                   |
| Decoded value looks wrong | Encoding mismatch                                  | Always pass `"base64"` as the second argument; omitting it defaults to raw bytes                                 |

**Related:** [Transaction Results Shape](/routes-d/496-transaction-results-shape), [Horizon Integration](/docs/integrations/horizon)
