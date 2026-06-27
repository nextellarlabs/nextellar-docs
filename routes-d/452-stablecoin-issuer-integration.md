---
title: Stablecoin Issuer Integration
description: How to integrate with a stablecoin issuer on Stellar, covering trustlines, KYC, payments, and redemption
---

# Stablecoin Issuer Integration

Integrating with a stablecoin issuer on Stellar involves three phases: establishing a trustline, completing KYC if required, and then executing payments and redemptions.

---

## Trustline Setup

Before a Stellar account can hold a stablecoin, it must create a trustline to the issuer's asset. Without a trustline the account will reject any incoming stablecoin transfers.

```js
import {
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  BASE_FEE,
} from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon.stellar.org');
const USDC_ISSUER = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';
const usdcAsset = new Asset('USDC', USDC_ISSUER);

async function createTrustline(keypair) {
  const account = await server.loadAccount(keypair.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.PUBLIC,
  })
    .addOperation(Operation.changeTrust({ asset: usdcAsset }))
    .setTimeout(30)
    .build();

  tx.sign(keypair);
  return server.submitTransaction(tx);
}
```

The default trust limit is the maximum possible value. Pass `limit` to `changeTrust` to cap how much of the asset the account can hold.

---

## KYC Steps

Many regulated stablecoin issuers require identity verification before they will transfer tokens to your account. KYC is handled off-chain via the issuer's web interface or SEP-12 protocol:

1. **Discover the anchor** — read the issuer's `stellar.toml` for the `KYC_SERVER` URL.
2. **Submit customer info** — `PUT /customer` with the required personal data fields.
3. **Poll for approval** — `GET /customer?id=<id>` until `status` is `ACCEPTED`.
4. **Receive tokens** — once approved, the issuer will allow deposits and transfers.

Check the issuer's documentation for exact fields; requirements vary by jurisdiction.

---

## Payment Flow

Once the trustline exists and KYC is complete, payments work like any other Stellar asset transfer:

```js
async function sendStablecoin(senderKeypair, destination, amount) {
  const account = await server.loadAccount(senderKeypair.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.PUBLIC,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: usdcAsset,
        amount: amount.toString(),
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(senderKeypair);
  return server.submitTransaction(tx);
}
```

---

## Redemption Flow

Redemption (converting stablecoins back to fiat) is also handled via the issuer's anchor:

1. **Initiate withdrawal** — call the anchor's `POST /transactions/withdraw` endpoint (SEP-24) with the asset code and amount.
2. **Follow the interactive flow** — the anchor returns a URL for identity confirmation or bank details.
3. **Send tokens to the anchor** — submit a Stellar payment to the anchor's receiving address with the transaction `id` as the memo.
4. **Wait for settlement** — the anchor monitors the ledger and releases fiat once the payment is confirmed.

---

## Compliance Signals

| Signal                        | Meaning                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------- |
| `AUTH_REQUIRED` flag on asset | Issuer must approve each trustline before the account can receive the asset     |
| `AUTH_REVOCABLE` flag         | Issuer can freeze balances; ensure your flow handles frozen accounts gracefully |
| `CLAWBACK_ENABLED` flag       | Issuer can reclaim tokens; relevant for regulated markets                       |
| Memo requirements             | Some issuers require a specific memo type/value on all deposits                 |

Always check the issuer's `stellar.toml` for compliance flags and memo requirements before going to production.

**Related:** [Horizon Integration](/docs/integrations/horizon), [Glossary](/docs/guides/glossary)
