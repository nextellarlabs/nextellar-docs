---
title: Soroban Contract Testing Harness
description: How to set up a unit and integration testing harness for Soroban contracts, including CI configuration
---

# Soroban Contract Testing Harness

Soroban contracts are Rust crates and use the standard `cargo test` pipeline. The `soroban-sdk` ships a `testutils` feature that provides an in-process simulated environment so tests run without a live network.

---

## Unit Layer

Unit tests live in the same file as the contract under `#[cfg(test)]`. They use `Env::default()` which runs everything in-process:

```rust
#![no_std]
use soroban_sdk::{contract, contractimpl, Env};

#[contract]
pub struct Counter;

#[contractimpl]
impl Counter {
    pub fn increment(env: Env) -> u32 {
        let val: u32 = env.storage().instance().get(&"count").unwrap_or(0);
        let next = val + 1;
        env.storage().instance().set(&"count", &next);
        next
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::Env;

    #[test]
    fn increments_from_zero() {
        let env = Env::default();
        let contract_id = env.register_contract(None, Counter);
        let client = CounterClient::new(&env, &contract_id);

        assert_eq!(client.increment(), 1);
        assert_eq!(client.increment(), 2);
    }
}
```

Enable `testutils` in `Cargo.toml`:

```toml
[dev-dependencies]
soroban-sdk = { version = "22", features = ["testutils"] }
```

---

## Integration Layer

Integration tests live in `tests/` and can deploy multiple contracts and simulate cross-contract calls:

```rust
// tests/integration.rs
use soroban_sdk::Env;

#[test]
fn cross_contract_flow() {
    let env = Env::default();
    env.mock_all_auths(); // skip auth for integration tests

    let contract_a = env.register_contract(None, ContractA);
    let contract_b = env.register_contract(None, ContractB);

    let client_a = ContractAClient::new(&env, &contract_a);
    let client_b = ContractBClient::new(&env, &contract_b);

    client_a.setup(&contract_b);
    let result = client_b.call_a();
    assert_eq!(result, expected_value);
}
```

---

## CI Configuration

```yaml
# .github/workflows/contracts.yml
name: Soroban Contracts

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          targets: wasm32-unknown-unknown

      - name: Cache cargo
        uses: actions/cache@v4
        with:
          path: |
            ~/.cargo/registry
            ~/.cargo/git
            target
          key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}

      - name: Run tests
        run: cargo test --features testutils
        working-directory: packages/contracts
```

---

## Notes

- `env.mock_all_auths()` disables signature verification in tests — useful for integration scenarios but do not ship this in production logic.
- Use `env.ledger().set_timestamp(ts)` to simulate time-dependent logic like TTL checks or cooldowns.
- Keep unit tests focused on single functions; reserve integration tests for multi-contract or state-transition scenarios.

**Related:** [Soroban Contract Upgrade Patterns](/routes-d/450-soroban-contract-upgrade-patterns), [Soroban Integration](/docs/integrations/soroban)
