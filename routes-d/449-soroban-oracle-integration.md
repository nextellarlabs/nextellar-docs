---
title: Soroban Oracle Integration
description: How to integrate an oracle with a Soroban contract, covering the trust model, contract-side handling, and a worked example
---

# Soroban Oracle Integration

Oracles bridge off-chain data (prices, randomness, weather, etc.) into on-chain Soroban contracts. Because Soroban contracts cannot make HTTP calls themselves, an oracle pushes data onto the ledger and the contract reads from it.

---

## Trust Model

A Soroban oracle typically works as a **push oracle**: a trusted off-chain process submits price data via a contract call, and consuming contracts read that stored value. The trust assumptions are:

- The oracle submitter address is known and stored in the contract at deployment.
- Only that address (or a multisig quorum) may update the price feed.
- Consumers must evaluate whether the data is stale before using it.

```rust
#[contracttype]
pub enum DataKey {
    OracleAdmin,
    Price(Symbol),
    LastUpdated(Symbol),
}
```

---

## Contract-Side Handling

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol};

#[contract]
pub struct OracleConsumer;

#[contractimpl]
impl OracleConsumer {
    /// Called by the trusted oracle admin to update a price feed.
    pub fn update_price(env: Env, caller: Address, feed: Symbol, price: i128) {
        caller.require_auth();
        let admin: Address = env.storage().instance().get(&DataKey::OracleAdmin).unwrap();
        assert!(caller == admin, "unauthorized");

        env.storage().instance().set(&DataKey::Price(feed.clone()), &price);
        env.storage().instance().set(&DataKey::LastUpdated(feed), &env.ledger().timestamp());
    }

    /// Read the latest price and check staleness.
    pub fn get_price(env: Env, feed: Symbol, max_age_seconds: u64) -> i128 {
        let last: u64 = env.storage().instance().get(&DataKey::LastUpdated(feed.clone())).unwrap();
        assert!(
            env.ledger().timestamp() - last <= max_age_seconds,
            "stale price"
        );
        env.storage().instance().get(&DataKey::Price(feed)).unwrap()
    }
}
```

---

## Worked Example

**Off-chain submitter** (Node.js) pushes an XLM/USD price every 60 seconds:

```js
import {
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { SorobanRpc } from '@stellar/stellar-sdk';

const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
const contract = new Contract(ORACLE_CONTRACT_ID);

async function pushPrice(adminKeypair, priceUsd) {
  const account = await server.getAccount(adminKeypair.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      contract.call(
        'update_price',
        adminKeypair.publicKey(),
        'XLM_USD',
        BigInt(Math.round(priceUsd * 1e7)) // 7 decimal precision
      )
    )
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(adminKeypair);
  return server.sendTransaction(prepared);
}
```

**Consuming contract** calls `get_price("XLM_USD", 120)` — rejects if the feed is more than 2 minutes old.

---

## Notes

- For higher trust guarantees, use a multisig admin (threshold-based signers) so no single key controls the feed.
- Emit events from `update_price` so consumers can subscribe to changes without polling.
- Consider `env.storage().ttl_extend()` to keep price storage entries alive across ledger expiry.

**Related:** [Soroban Integration](/docs/integrations/soroban), [Horizon Integration](/docs/integrations/horizon)
