---
title: Soroban Contract Upgrade Patterns
description: Common approaches for upgrading Soroban smart contracts, migration safety considerations, and a worked example
---

# Soroban Contract Upgrade Patterns

Soroban supports on-chain contract upgrades through a built-in `update_current_contract_wasm` host function. This lets you replace a deployed contract's Wasm bytecode without changing its contract ID or losing stored state.

---

## Approaches Compared

| Approach                       | How it works                                                                        | Migration safety                                              | Best for                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| **In-place Wasm upgrade**      | Replace bytecode via `update_current_contract_wasm`; same contract ID, same storage | Storage layout must remain compatible; no automatic migration | Non-breaking changes: bug fixes, new read-only functions      |
| **Proxy / Router pattern**     | A stable router contract delegates calls to an upgradeable implementation contract  | Implementation can change freely; router handles versioning   | Contracts with complex upgrade logic or rollback requirements |
| **New deployment + migration** | Deploy a new contract, migrate state off-chain or via a migration script            | Cleanest isolation, but changes the contract ID               | Major breaking changes or state restructuring                 |

---

## In-Place Upgrade Example

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Address, BytesN, Env};

#[contract]
pub struct UpgradeableContract;

#[contractimpl]
impl UpgradeableContract {
    /// Replace the contract's Wasm. Only callable by the stored admin.
    pub fn upgrade(env: Env, caller: Address, new_wasm_hash: BytesN<32>) {
        caller.require_auth();
        let admin: Address = env.storage().instance().get(&"admin").unwrap();
        assert!(caller == admin, "unauthorized");

        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }
}
```

Off-chain, upload the new Wasm and get its hash:

```js
import { SorobanRpc, Operation } from '@stellar/stellar-sdk';

const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');

async function uploadWasm(adminKeypair, wasmBuffer) {
  const account = await server.getAccount(adminKeypair.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.uploadContractWasm({ wasm: wasmBuffer }))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  prepared.sign(adminKeypair);
  const result = await server.sendTransaction(prepared);
  // result contains the new Wasm hash — pass it to `upgrade()`
  return result;
}
```

---

## Migration Safety

- **Never change the type of an existing storage key.** If `DataKey::Counter` stored a `u64` in v1, it must still store a `u64` in v2 or deserialization will panic.
- **Add new keys, do not reuse old ones with different types.**
- **Run a staging upgrade on testnet first.** Replay production-like state to catch deserialization issues before hitting mainnet.
- **Emit an event** from the upgrade function so indexers can detect the bytecode change.

---

## Notes

- `update_current_contract_wasm` takes effect immediately on the next invocation after the upgrade transaction closes.
- The contract ID and all stored data remain intact after an in-place upgrade.
- Soroban does not support automatic state migration — plan schema changes explicitly.

**Related:** [Soroban Integration](/docs/integrations/soroban), [Soroban Testing Harness](/routes-d/453-soroban-testing-harness)
