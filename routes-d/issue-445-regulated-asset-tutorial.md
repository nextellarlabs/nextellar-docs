---
title: Launching a Regulated Asset on Stellar
description: A complete tutorial covering auth flags, issuer setup, trustline authorization workflows, clawback, and legal touchpoints for regulated assets on Stellar
---

# Launching a Regulated Asset on Stellar

A **regulated asset** on Stellar is one whose issuer retains ongoing control over who can hold and transfer it. This is required for securities, central-bank digital currencies, and compliance-bound stablecoins. Stellar provides three account flags to enforce this control. This tutorial covers every step from account setup to clawback.

---

## The Three Auth Flags

| Flag                             | Constant                       | Effect                                                                                                                     |
| -------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `AUTHORIZATION_REQUIRED`         | `AuthFlag.AuthRequired`        | New trustlines start unauthorized; the issuer must explicitly allow each holder before they can receive or send the asset. |
| `AUTHORIZATION_REVOCABLE`        | `AuthFlag.AuthRevocable`       | The issuer can freeze any existing authorized trustline, blocking all transfers while preserving the balance.              |
| `AUTHORIZATION_CLAWBACK_ENABLED` | `AuthFlag.AuthClawbackEnabled` | The issuer can reclaim tokens from any holder without consent. Requires `AUTH_REVOCABLE` to be set first.                  |

Set flags you genuinely need. `AUTH_REQUIRED` alone is the minimum for most securities. `CLAWBACK_ENABLED` creates significant holder risk and should only be used when legally mandated.

---

## Step 1 — Set Up the Issuer Account

The issuer account is the source of truth for the regulated asset. Generate a fresh keypair and fund it. Never use this keypair for any other purpose.

```js
import {
  Keypair,
  TransactionBuilder,
  Operation,
  Networks,
  BASE_FEE,
  AuthFlag,
} from '@stellar/stellar-sdk';
import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

// Generate and fund issuer (on testnet: use Friendbot)
const issuerKeypair = Keypair.random();
await fetch(`https://friendbot.stellar.org?addr=${issuerKeypair.publicKey()}`);

// Load the account and set the required flags
const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

const flagsTx = new TransactionBuilder(issuerAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.setOptions({
      setFlags:
        AuthFlag.AuthRequired |
        AuthFlag.AuthRevocable |
        AuthFlag.AuthClawbackEnabled,
    })
  )
  .setTimeout(30)
  .build();

flagsTx.sign(issuerKeypair);
await server.submitTransaction(flagsTx);
console.log('Issuer flags set:', issuerKeypair.publicKey());
```

---

## Step 2 — Set Up the Distribution Account

Direct issuance from the issuer account to end users is a bad practice because it complicates reserve management and audit trails. Use a **distribution account** instead:

1. Create a separate Stellar account (the distributor).
2. Have the distributor create a trustline to the regulated asset.
3. The issuer authorizes the distributor's trustline.
4. The issuer mints tokens by sending a payment to the distributor.
5. The distributor sends tokens to authorized end-user accounts.

```js
const distributorKeypair = Keypair.random();
await fetch(
  `https://friendbot.stellar.org?addr=${distributorKeypair.publicKey()}`
);

const { Asset } = await import('@stellar/stellar-sdk');
const regulatedAsset = new Asset('RSEC', issuerKeypair.publicKey());

// Distributor creates a trustline
const distributorAccount = await server.loadAccount(
  distributorKeypair.publicKey()
);
const trustlineTx = new TransactionBuilder(distributorAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.changeTrust({
      asset: regulatedAsset,
      limit: '1000000', // maximum tokens the distributor can hold
    })
  )
  .setTimeout(30)
  .build();

trustlineTx.sign(distributorKeypair);
await server.submitTransaction(trustlineTx);
```

---

## Step 3 — Authorize the Distributor's Trustline

Because `AUTH_REQUIRED` is set, the issuer must authorize the distributor before any tokens can flow:

```js
const issuerAccount2 = await server.loadAccount(issuerKeypair.publicKey());

const authorizeTx = new TransactionBuilder(issuerAccount2, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.setTrustLineFlags({
      trustor: distributorKeypair.publicKey(),
      asset: regulatedAsset,
      flags: {
        authorized: true,
        authorizedToMaintainLiabilities: false,
      },
    })
  )
  .setTimeout(30)
  .build();

authorizeTx.sign(issuerKeypair);
await server.submitTransaction(authorizeTx);
```

Then mint tokens by sending a payment from the issuer to the distributor:

```js
const mintAccount = await server.loadAccount(issuerKeypair.publicKey());

const mintTx = new TransactionBuilder(mintAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.payment({
      destination: distributorKeypair.publicKey(),
      asset: regulatedAsset,
      amount: '500000',
    })
  )
  .setTimeout(30)
  .build();

mintTx.sign(issuerKeypair);
await server.submitTransaction(mintTx);
```

---

## Step 4 — Authorize End-User Trustlines

When a user wants to hold the regulated asset, they first create a trustline. Your backend then authorizes it after completing KYC:

```js
// User creates trustline (wallet-side)
async function userCreatesTrustline(userKeypair) {
  const userAccount = await server.loadAccount(userKeypair.publicKey());
  const tx = new TransactionBuilder(userAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.changeTrust({ asset: regulatedAsset }))
    .setTimeout(30)
    .build();
  tx.sign(userKeypair);
  return server.submitTransaction(tx);
}

// Issuer backend authorizes after KYC passes
async function authorizeHolder(holderPublicKey) {
  const account = await server.loadAccount(issuerKeypair.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.setTrustLineFlags({
        trustor: holderPublicKey,
        asset: regulatedAsset,
        flags: { authorized: true, authorizedToMaintainLiabilities: false },
      })
    )
    .setTimeout(30)
    .build();
  tx.sign(issuerKeypair);
  return server.submitTransaction(tx);
}
```

---

## Step 5 — Revoking Authorization (Freeze)

When an account violates terms or is flagged by compliance, revoke their trustline authorization:

```js
async function freezeHolder(holderPublicKey) {
  const account = await server.loadAccount(issuerKeypair.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.setTrustLineFlags({
        trustor: holderPublicKey,
        asset: regulatedAsset,
        flags: { authorized: false, authorizedToMaintainLiabilities: false },
      })
    )
    .setTimeout(30)
    .build();
  tx.sign(issuerKeypair);
  return server.submitTransaction(tx);
}
```

A frozen holder cannot send or receive the asset, but retains their balance. Reauthorize with `authorized: true` to unfreeze.

---

## Step 6 — Clawback

`CLAWBACK_ENABLED` allows the issuer to reclaim tokens from any account, including frozen ones. This is irreversible:

```js
async function clawback(holderPublicKey, amount) {
  const account = await server.loadAccount(issuerKeypair.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.clawback({
        asset: regulatedAsset,
        from: holderPublicKey,
        amount: amount.toString(),
      })
    )
    .setTimeout(30)
    .build();
  tx.sign(issuerKeypair);
  return server.submitTransaction(tx);
}
```

---

## Legal and Compliance Touchpoints

**OFAC / sanctions screening.** Before authorizing any trustline, screen the account against sanctions lists. Third-party services (e.g., Chainalysis, Elliptic) offer API-based lookups against OFAC SDN and equivalent lists. Never skip this step for securities or regulated stablecoins.

**KYC / AML requirements.** Most jurisdictions require Know Your Customer checks before issuing regulated assets to retail holders. Integrate a KYC provider and gate trustline authorization on a passed check result stored in your database.

**Jurisdiction-specific restrictions.** Certain asset types (securities, commodity tokens) cannot be legally offered to residents of specific jurisdictions. Collect and verify the holder's country of residence before authorization. Maintain an allowlist of permitted jurisdictions.

**Audit trail.** Log every authorization, freeze, and clawback event — including the transaction hash, the operator who triggered it, and the compliance reason. This record is typically required by regulators.

**Custodian and legal counsel.** Before launching on mainnet, engage a qualified attorney in your jurisdiction to review the asset structure, flag applicability, and any required registrations (securities exemption, money transmitter license, etc.).

---

## Notes

- `AUTH_CLAWBACK_ENABLED` cannot be set unless `AUTH_REVOCABLE` is also set.
- Once `AUTH_CLAWBACK_ENABLED` is set, it cannot be removed. Plan your flag strategy before deployment.
- The distribution account pattern is optional but strongly recommended for auditability and reserve separation.

**Related:** [Asset Compliance Flags](/routes-d/504-asset-compliance-flags), [Horizon Integration](/docs/integrations/horizon), [Stablecoin Issuer Integration](/routes-d/452-stablecoin-issuer-integration)
