---
title: set_trust_line_flags Operation
description: How issuers authorize, restrict, and freeze Stellar trustlines with set_trust_line_flags
---

# set_trust_line_flags Operation

The `set_trust_line_flags` operation updates authorization flags on an existing trustline. Asset issuers use it to approve holders, limit holders to existing liabilities, or freeze a holder's access to an issued asset.

This operation is called by the asset issuer. In SDK code, that usually means the transaction source account is the issuer, or the operation source account is explicitly set to the issuer.

---

## When to Use It

Use `set_trust_line_flags` when an issued asset depends on per-holder authorization:

- Authorize a holder after onboarding or KYC
- Freeze a holder that should no longer send or receive the asset
- Move a holder into a restricted state where existing liabilities can be maintained or reduced
- Re-authorize a holder after a review is complete

The target trustline must already exist. The holder creates the trustline with `change_trust`; the issuer then updates its flags.

---

## Trustline Flags

| Flag                                      | SDK field                         | Effect                                                                                             |
| ----------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| `AUTHORIZED_FLAG`                         | `authorized`                      | The holder can send, receive, trade, and otherwise use the asset normally                          |
| `AUTHORIZED_TO_MAINTAIN_LIABILITIES_FLAG` | `authorizedToMaintainLiabilities` | The holder is not fully authorized, but can maintain and reduce existing liabilities for the asset |

Use one authorization state at a time. A trustline should be fully authorized, maintain-liabilities only, or unauthorized.

---

## Common Flag Combinations

| State                 | `authorized` | `authorizedToMaintainLiabilities` | Holder effect                                                                        |
| --------------------- | ------------ | --------------------------------- | ------------------------------------------------------------------------------------ |
| Fully authorized      | `true`       | `false`                           | Holder can receive, send, and trade the asset                                        |
| Maintain liabilities  | `false`      | `true`                            | Holder cannot freely transact, but existing liabilities can be maintained or reduced |
| Frozen / unauthorized | `false`      | `false`                           | Holder keeps any balance but cannot send or receive the asset                        |

Avoid setting both fields to `true`. If a holder should be fully authorized, set `authorized: true` and clear `authorizedToMaintainLiabilities`.

---

## Holder Effects

Changing trustline flags affects only the selected holder and asset pair:

- A fully authorized holder can receive payments, send payments, create offers, and participate in normal asset flows.
- A frozen holder keeps the balance already on the trustline, but attempts to send or receive the asset fail with authorization-related result codes.
- A maintain-liabilities holder is useful when the issuer wants to restrict new activity without immediately breaking existing liabilities.

The issuer must have `AUTH_REVOCABLE` enabled before it can revoke an authorization. If the issuer does not make authorization revocable, it can authorize trustlines but cannot later clear that authorization.

---

## Example: Authorize a Holder

```js
import {
  Asset,
  BASE_FEE,
  Horizon,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

const issuerKeypair = Keypair.fromSecret(process.env.ISSUER_SECRET);
const holderPublicKey = 'G...';
const asset = new Asset('ACME', issuerKeypair.publicKey());

const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

const tx = new TransactionBuilder(issuerAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.setTrustLineFlags({
      trustor: holderPublicKey,
      asset,
      flags: {
        authorized: true,
        authorizedToMaintainLiabilities: false,
      },
    })
  )
  .setTimeout(30)
  .build();

tx.sign(issuerKeypair);
await server.submitTransaction(tx);
```

---

## Example: Freeze a Holder

```js
const freezeTx = new TransactionBuilder(issuerAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.setTrustLineFlags({
      trustor: holderPublicKey,
      asset,
      flags: {
        authorized: false,
        authorizedToMaintainLiabilities: false,
      },
    })
  )
  .setTimeout(30)
  .build();

freezeTx.sign(issuerKeypair);
await server.submitTransaction(freezeTx);
```

---

## Operational Notes

- Confirm the trustline exists before submitting the issuer operation; otherwise the result is `SET_TRUST_LINE_FLAGS_NO_TRUST_LINE`.
- Keep an audit trail for every authorization, restriction, and freeze decision.
- Re-check issuer account flags before relying on freeze flows in production.
- For regulated assets, run sanctions, KYC, or policy checks before authorizing a trustline.

**Related:** [Asset Compliance Flags](/routes-d/504-asset-compliance-flags), [Reading Account Flags](/routes-d/485-reading-account-flags), [Change Trust Operation](/routes-d/issue-510-change-trust-operation)
