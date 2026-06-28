---
title: Managing Trustline Limits
description: How to set and change trustline limits on Stellar, including the limit field semantics, authority constraints, and practical JavaScript examples
---

# Managing Trustline Limits

A trustline is the on-ledger record that allows a Stellar account to hold a non-native asset. Every trustline carries a **limit** — the maximum amount of that asset the account is willing to hold. This guide explains how to set and change that limit correctly.

---

## The `limit` Field

When you create or modify a trustline you supply a `limit` value (expressed in the asset's smallest unit, like lumens are expressed in stroops):

| Value | Meaning |
|---|---|
| A positive integer | Maximum balance the account will accept for this asset |
| `"0"` (string zero) | **Removes** the trustline (only if the current balance is zero) |
| `"922337203685.4775807"` | The maximum possible limit (equivalent to `INT64_MAX / 10 000 000`) |

The Stellar network rejects any incoming payment that would push the account's balance above the trustline limit, so choose a value that makes sense for your users' expected balances.

---

## Authority Constraints

- **Account owner only** — only the account that holds the trustline can set or change its limit; the asset issuer cannot change another account's trustline limit.
- **Cannot decrease below current balance** — if an account holds 500 USDC, you cannot set the limit to 400. The operation will fail with `CHANGE_TRUST_INVALID_LIMIT`.
- **Authorized flag** — if the issuer has `AUTH_REQUIRED` set, the account must be authorized by the issuer before it can receive any balance, regardless of the trustline limit.
- **Base reserve** — each trustline costs 0.5 XLM in base reserve. Removing a trustline (limit = 0) recovers that reserve.

---

## Example: Creating and Modifying a Trustline

```js
import {
  Horizon,
  Keypair,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
} from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon.stellar.org");

// Create a trustline with a specific limit
async function createTrustline(sourceKeypair, assetCode, assetIssuer, limitAmount) {
  const account = await server.loadAccount(sourceKeypair.publicKey());
  const asset = new Asset(assetCode, assetIssuer);

  const tx = new TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: Networks.PUBLIC,
  })
    .addOperation(
      Operation.changeTrust({
        asset,
        limit: limitAmount, // e.g. "1000.0000000" — seven decimal places
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(sourceKeypair);
  return server.submitTransaction(tx);
}

// Increase an existing trustline limit
async function increaseTrustlineLimit(sourceKeypair, assetCode, assetIssuer, newLimit) {
  return createTrustline(sourceKeypair, assetCode, assetIssuer, newLimit);
}

// Remove a trustline (balance must be zero first)
async function removeTrustline(sourceKeypair, assetCode, assetIssuer) {
  return createTrustline(sourceKeypair, assetCode, assetIssuer, "0");
}
```

---

## Checking the Current Limit

```js
async function getTrustlineInfo(publicKey, assetCode, assetIssuer) {
  const account = await server.loadAccount(publicKey);
  const trustline = account.balances.find(
    (b) => b.asset_code === assetCode && b.asset_issuer === assetIssuer
  );

  if (!trustline) {
    return { exists: false };
  }

  return {
    exists: true,
    balance: trustline.balance,
    limit: trustline.limit,
    authorized: trustline.is_authorized,
  };
}
```

---

## Notes

- **Set a meaningful limit** — avoid setting the limit to `INT64_MAX` by default; a tighter limit reflects the account's actual risk tolerance and may be required by some regulatory or compliance workflows.
- **Non-native assets only** — XLM (the native asset) never requires a trustline.
- **Path payments respect limits** — a path payment will fail if the destination's trustline limit would be exceeded after crediting the asset.

**Related:** [Asset Compliance Flags](/routes-d/504-asset-compliance-flags), [Reading Account Flags](/routes-d/485-reading-account-flags), [Stablecoin Issuer Integration](/routes-d/452-stablecoin-issuer-integration)
