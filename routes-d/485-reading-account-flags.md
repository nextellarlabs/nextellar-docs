---
title: Reading Account Flags
description: How to read and interpret account flags from Horizon responses, with a parsing example and common flag combinations
---

# Reading Account Flags

Stellar accounts carry a set of boolean flags that control trustline authorization and asset behavior. Horizon returns these as both a raw integer bitmask and pre-parsed boolean fields.

---

## The Flags Field Shape

When you fetch an account from Horizon, the `flags` object contains three parsed booleans:

```json
{
  "flags": {
    "auth_required": true,
    "auth_revocable": true,
    "auth_immutable": false,
    "auth_clawback_enabled": false
  }
}
```

| Flag                    | Meaning                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| `auth_required`         | Trustlines to this account's assets must be explicitly authorized by the account before the holder can transact |
| `auth_revocable`        | The account can revoke (freeze) existing trustlines                                                             |
| `auth_immutable`        | The account's flags can never be changed again                                                                  |
| `auth_clawback_enabled` | The account can claw back issued assets from holders                                                            |

---

## Parsing Example

```js
import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon.stellar.org');

async function readAccountFlags(publicKey) {
  const account = await server.loadAccount(publicKey);
  const { flags } = account;

  console.log('Auth required:', flags.auth_required);
  console.log('Auth revocable:', flags.auth_revocable);
  console.log('Auth immutable:', flags.auth_immutable);
  console.log('Clawback enabled:', flags.auth_clawback_enabled);

  return flags;
}
```

---

## Common Combinations

| Combination                                                  | Typical use case                                                        |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| All false                                                    | Open community token; anyone with a trustline can transact freely       |
| `auth_required` + `auth_revocable`                           | Regulated asset (KYC required, issuer can freeze)                       |
| `auth_required` + `auth_revocable` + `auth_clawback_enabled` | Fully compliant security or CBDC                                        |
| `auth_immutable` set alone                                   | Issuer has permanently locked flags to signal no future control changes |

---

## Checking Before Operations

```js
async function canHolderTransact(issuerPublicKey) {
  const issuer = await server.loadAccount(issuerPublicKey);

  if (issuer.flags.auth_required) {
    // Must also check that the specific trustline is authorized
    console.warn('Asset requires issuer authorization per trustline');
  }

  if (issuer.flags.auth_revocable) {
    console.warn('Issuer can freeze this asset at any time');
  }
}
```

**Related:** [Asset Compliance Flags](/routes-d/504-asset-compliance-flags), [Horizon Integration](/docs/integrations/horizon)
