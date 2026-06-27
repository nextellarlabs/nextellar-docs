---
title: Manage Data Operation
description: How to set and remove key-value data entries on a Stellar account using the ManageData operation, with size limits and a small example
---

# Manage Data Operation

The `ManageData` operation lets you attach arbitrary key-value string pairs to a Stellar account. These entries are stored on-ledger and visible to anyone who reads the account record from Horizon. Common uses include storing a DID, marking an account for protocol-level feature flags, or anchoring off-chain records.

---

## Storage Size Limits

| Property            | Limit                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------- |
| Key length          | 1 – 64 bytes (UTF-8)                                                                    |
| Value length        | 0 – 64 bytes (arbitrary binary)                                                         |
| Entries per account | Up to the account's available subentry capacity (each entry costs 0.5 XLM base reserve) |

Setting a value of `null` or an empty buffer removes the entry and releases its reserve.

---

## Set Flow

```js
import {
  Horizon,
  Keypair,
  TransactionBuilder,
  Operation,
  Networks,
} from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');
const keypair = Keypair.fromSecret('S...');

async function setDataEntry(key, value) {
  const account = await server.loadAccount(keypair.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.manageData({
        name: key, // up to 64 bytes
        value: Buffer.from(value, 'utf8'), // up to 64 bytes; null to delete
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(keypair);
  const result = await server.submitTransaction(tx);
  console.log('Data entry set. Tx hash:', result.hash);
}
```

---

## Remove Flow

Pass `null` (or omit `value`) to delete an existing entry:

```js
async function removeDataEntry(key) {
  const account = await server.loadAccount(keypair.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.manageData({
        name: key,
        value: null, // null removes the entry
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(keypair);
  await server.submitTransaction(tx);
  console.log('Data entry removed:', key);
}
```

---

## Reading Entries

Horizon returns all data entries in the `data` object of the account record, with values base64-encoded:

```js
async function readDataEntries(publicKey) {
  const account = await server.loadAccount(publicKey);

  for (const [key, b64Value] of Object.entries(account.data_attr)) {
    const value = Buffer.from(b64Value, 'base64').toString('utf8');
    console.log(`${key} = ${value}`);
  }
}
```

---

## Small Example

```js
// Store a DID document reference on the account
await setDataEntry('did', 'did:stellar:GAAZI4TCR...');

// Read it back
const account = await server.loadAccount(keypair.publicKey());
const raw = account.data_attr['did'];
console.log(Buffer.from(raw, 'base64').toString('utf8'));
// → did:stellar:GAAZI4TCR...

// Remove it when no longer needed
await removeDataEntry('did');
```

**Related:** [Reading Account Flags](/routes-d/485-reading-account-flags), [Horizon Integration](/docs/integrations/horizon)
