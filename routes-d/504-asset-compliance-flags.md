---
title: Asset Compliance Flags
description: How Stellar asset compliance flags interact and their observable effects on trustlines and holders
---

# Asset Compliance Flags

Stellar issuers can set flags on their issuing account to control how the asset behaves for all holders. The three compliance-relevant flags are `AUTH_REQUIRED`, `AUTH_REVOCABLE`, and `CLAWBACK_ENABLED`.

---

## The Flags

| Flag               | Bit   | Effect                                                                                                                                                 |
| ------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AUTH_REQUIRED`    | `0x1` | Trustlines to this asset start in an unauthorized state; the issuer must explicitly authorize each one before the holder can receive or send the asset |
| `AUTH_REVOCABLE`   | `0x2` | The issuer can deauthorize (freeze) a trustline at any time, preventing the holder from moving the asset                                               |
| `CLAWBACK_ENABLED` | `0x8` | The issuer can call back (reclaim) tokens from any holder's account                                                                                    |

---

## Common Combinations

### Regulated Asset (AUTH_REQUIRED + AUTH_REVOCABLE)

The most common compliance setup. Issuers grant access after KYC and can freeze accounts that violate terms.

```js
// Check if a trustline is authorized before attempting payment
const account = await server.loadAccount(senderPublicKey);
const trustline = account.balances.find(
  (b) => b.asset_code === 'ACME' && b.asset_issuer === ISSUER
);

if (trustline?.is_authorized === false) {
  throw new Error('Trustline not yet authorized by issuer');
}
```

### Full Compliance (AUTH_REQUIRED + AUTH_REVOCABLE + CLAWBACK_ENABLED)

Used for securities or central-bank digital currencies where the issuer must retain full control over all outstanding balances.

### No Flags (Open Asset)

An asset with no flags set — like most community tokens — can be held by any account that creates a trustline. The issuer has no ongoing control.

---

## Observable Effects on Holders

| Holder action | AUTH_REQUIRED off | AUTH_REQUIRED on, authorized | AUTH_REQUIRED on, not authorized               |
| ------------- | ----------------- | ---------------------------- | ---------------------------------------------- |
| Receive asset | ✓                 | ✓                            | ✗ (`op_not_authorized`)                        |
| Send asset    | ✓                 | ✓                            | ✗                                              |
| Hold balance  | ✓                 | ✓                            | ✓ (can hold existing balance, cannot transact) |

When `AUTH_REVOCABLE` is on and a trustline is deauthorized, the holder's existing balance is frozen in place — they cannot send or receive — until the issuer re-authorizes.

When `CLAWBACK_ENABLED` is on, the issuer can reduce a holder's balance at any time using `ClawbackOp`, regardless of the holder's consent.

---

## Example: Authorizing a Trustline

```js
import { Operation } from '@stellar/stellar-sdk';

// Issuer authorizes a holder's trustline
const op = Operation.setTrustLineFlags({
  trustor: holderPublicKey,
  asset: regulatedAsset,
  flags: {
    authorized: true,
    authorizedToMaintainLiabilities: false,
  },
});
```

**Related:** [Horizon Integration](/docs/integrations/horizon), [Stablecoin Issuer Integration](/routes-d/452-stablecoin-issuer-integration)
