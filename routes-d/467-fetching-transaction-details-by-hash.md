---
title: Fetching Transaction Details by Hash
description: How to retrieve a transaction's full details from Horizon using its hash, with endpoint reference and common errors
---

# Fetching Transaction Details by Hash

Every submitted transaction has a unique hash that Horizon uses as its primary identifier. You can use this hash to retrieve the full transaction record at any time — useful for confirming payment status, reading operation results, or debugging submission failures.

---

## Endpoint

```
GET https://horizon.stellar.org/transactions/{hash}
```

Replace `{hash}` with the hex-encoded SHA-256 transaction hash (64 characters).

---

## Response Shape

```json
{
  "hash": "3389e9f0f1a65f19736cacf544c2e825313e8447f569233bb8db39aa607c8889",
  "ledger": 27147222,
  "created_at": "2021-12-07T17:44:00Z",
  "source_account": "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN",
  "fee_charged": "100",
  "operation_count": 1,
  "envelope_xdr": "AAAAAgAAAA...",
  "result_xdr": "AAAAAAAAAGQ...",
  "result_meta_xdr": "AAAAAwAAAAI...",
  "memo_type": "none",
  "signatures": ["..."],
  "successful": true
}
```

Key fields:

| Field          | Description                                           |
| -------------- | ----------------------------------------------------- |
| `hash`         | Unique transaction identifier                         |
| `ledger`       | Ledger sequence number that included this transaction |
| `successful`   | `true` if all operations in the transaction succeeded |
| `envelope_xdr` | Base64 XDR of the full signed transaction envelope    |
| `result_xdr`   | Base64 XDR of the per-operation results               |
| `fee_charged`  | Actual fee deducted in stroops                        |

---

## Example

```js
import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon.stellar.org');

async function getTransactionByHash(hash) {
  const tx = await server.transactions().transaction(hash).call();

  console.log('Successful:', tx.successful);
  console.log('Ledger:', tx.ledger);
  console.log('Operations:', tx.operation_count);
  console.log('Fee charged:', tx.fee_charged, 'stroops');

  return tx;
}
```

For testnet, replace the server URL with `https://horizon-testnet.stellar.org`.

---

## Common Errors

| Error             | Cause                                               | Fix                                                        |
| ----------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| `404 Not Found`   | Hash not on the network yet or was never submitted  | Confirm submission succeeded; wait a few seconds and retry |
| `400 Bad Request` | Malformed hash (wrong length or non-hex characters) | Verify the hash is exactly 64 hex characters               |
| `403 Forbidden`   | Horizon node has restricted access to this endpoint | Use the public Horizon endpoint or your own node           |

**Related:** [XDR Encoding and Decoding](/routes-d/482-xdr-encoding-decoding), [Transaction Results Shape](/routes-d/496-transaction-results-shape)
