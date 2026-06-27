---
title: Transaction Envelope Formats
description: A brief overview of Stellar transaction envelope formats, version differences, and how to work with them
---

# Transaction Envelope Formats

A Stellar transaction is always wrapped in an envelope before it is submitted to the network. The envelope pairs the transaction body with one or more cryptographic signatures. Horizon returns envelopes as base64-encoded XDR strings.

---

## Envelope Shapes

Stellar currently uses two envelope variants:

### `TransactionV0Envelope`

The original format, used by transactions built before Protocol 13. Contains the classic `Transaction` body (no fee-bump support, no inner transaction).

```
TransactionV0Envelope
  └── TransactionV0      (source account, fee, sequence, time bounds, memo, operations)
  └── DecoratedSignature[] (signer + signature pairs)
```

### `TransactionV1Envelope`

Introduced in Protocol 13. Identical in structure to V0 but uses a different XDR discriminant, which allows it to be wrapped inside a `FeeBumpTransaction`.

```
TransactionV1Envelope
  └── Transaction        (same fields as V0 plus ext for future additions)
  └── DecoratedSignature[]
```

### `FeeBumpTransactionEnvelope`

Wraps a `TransactionV1Envelope` so a fee sponsor can pay the base fee without modifying the inner transaction's signatures.

```
FeeBumpTransactionEnvelope
  └── FeeBumpTransaction (fee source, fee, inner TransactionV1Envelope)
  └── DecoratedSignature[]  (sponsor's signature)
```

---

## Version Differences

| Property                          | V0                    | V1                 | Fee Bump                    |
| --------------------------------- | --------------------- | ------------------ | --------------------------- |
| Protocol introduced               | Pre-13                | 13                 | 13                          |
| Can be fee-bumped                 | No                    | Yes                | —                           |
| `ext` field for future extensions | No                    | Yes                | Yes                         |
| XDR discriminant                  | `ENVELOPE_TYPE_TX_V0` | `ENVELOPE_TYPE_TX` | `ENVELOPE_TYPE_TX_FEE_BUMP` |

The Stellar SDK always builds `TransactionV1Envelope` by default. You only encounter V0 envelopes when reading historical transactions predating Protocol 13.

---

## Working with Envelopes

```js
import { TransactionBuilder, xdr } from '@stellar/stellar-sdk';

// Build a transaction — returns a V1 envelope by default
const tx = new TransactionBuilder(account, { fee: '100', networkPassphrase })
  .addOperation(/* ... */)
  .setTimeout(30)
  .build();

// Serialize to base64 XDR for signing or storage
const envelopeXdr = tx.toEnvelope().toXDR('base64');

// Deserialize back
const decoded = xdr.TransactionEnvelope.fromXDR(envelopeXdr, 'base64');
const type = decoded.switch().name;
// "envelopeTypeTx" for V1, "envelopeTypeTxV0" for V0, "envelopeTypeTxFeeBump" for fee-bump
```

**Related:** [XDR Encoding and Decoding](/routes-d/482-xdr-encoding-decoding), [Fetching Transaction Details by Hash](/routes-d/467-fetching-transaction-details-by-hash)
