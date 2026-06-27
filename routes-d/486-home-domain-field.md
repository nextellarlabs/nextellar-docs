---
title: The home_domain Field
description: How to set and use the home_domain account field, its role in stellar.toml discovery, and a small example
---

# The `home_domain` Field

Every Stellar account can store a `home_domain` string — a plain domain name (e.g. `example.com`) that points to the web server hosting that issuer's `stellar.toml` file. Wallets, exchanges, and other clients use this field to discover asset metadata, federation servers, and compliance endpoints without any out-of-band configuration.

---

## How the Field Is Set

`home_domain` is set via the `SetOptions` operation:

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

async function setHomeDomain(domain) {
  const account = await server.loadAccount(keypair.publicKey());

  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.setOptions({
        homeDomain: domain, // e.g. "example.com" — no scheme, no trailing slash
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(keypair);
  await server.submitTransaction(tx);
  console.log('home_domain set to:', domain);
}
```

Constraints:

- Maximum 32 characters.
- No `https://` scheme — just the bare domain.
- No trailing slash.

---

## TOML Discovery Integration

Once `home_domain` is set, the TOML file must be reachable at:

```
https://<home_domain>/.well-known/stellar.toml
```

The file must be served over HTTPS with a `Content-Type` of `text/plain` and include a `CORS` header allowing `*`.

A minimal `stellar.toml` for an issuing account:

```toml
NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
FEDERATION_SERVER="https://example.com/federation"

[[CURRENCIES]]
code="USDC"
issuer="G..."
display_decimals=2
name="USD Coin"
desc="A fiat-backed stablecoin."
```

Horizon includes `home_domain` in every account record, so any client can perform the lookup:

```js
async function fetchToml(publicKey) {
  const account = await server.loadAccount(publicKey);
  const domain = account.home_domain;

  if (!domain) {
    throw new Error('Account has no home_domain set');
  }

  const res = await fetch(`https://${domain}/.well-known/stellar.toml`);
  return res.text(); // parse with a TOML library
}
```

---

## Example: Resolving an Asset's Metadata

```js
import { StellarToml } from '@stellar/stellar-sdk';

async function getAssetInfo(issuerPublicKey) {
  const account = await server.loadAccount(issuerPublicKey);
  const domain = account.home_domain;

  if (!domain) return null;

  const toml = await StellarToml.Resolver.resolve(domain);
  return toml.CURRENCIES; // array of currency descriptors
}
```

**Related:** [Federation Address Resolution](/routes-d/464-federation-address-resolution), [Horizon Integration](/docs/integrations/horizon)
