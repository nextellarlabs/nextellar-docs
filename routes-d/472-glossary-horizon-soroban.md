---
title: "Glossary: Horizon and Soroban"
description: Short definitions for Horizon and Soroban as used in the Stellar ecosystem and Nextellar docs
---

# Glossary: Horizon and Soroban

Two distinct layers of the Stellar ecosystem that serve different purposes.

---

## Horizon

The HTTP API server maintained by the Stellar Development Foundation that provides a RESTful interface to the Stellar network. Horizon indexes ledger data and exposes it through endpoints for accounts, transactions, operations, assets, offers, and streaming updates.

Nextellar hooks use Horizon to read account balances, submit transactions, and fetch history. You do not interact with the Stellar network directly — you talk to a Horizon server, which handles the peer-to-peer layer for you.

**Common usage:** `GET /accounts/{id}`, `POST /transactions`, `GET /accounts/{id}/operations`

**Related:** Stellar SDK, `useStellarBalances`, `useTransactionHistory`

---

## Soroban

Stellar's smart contract platform, introduced in Protocol 20. Soroban contracts are written in Rust, compiled to WebAssembly, and run inside the Stellar validator. They extend Stellar's capabilities beyond payments to arbitrary programmable logic.

Soroban uses a separate RPC interface (not Horizon) for contract deployment and invocation, though Horizon can still be used to observe the resulting ledger changes.

**Common usage:** token contracts, on-chain voting, DeFi primitives, oracle integrations

**Related:** Soroban RPC, `#[contractimpl]`, Horizon, WebAssembly

**Related docs:** [Soroban Integration](/docs/integrations/soroban), [Horizon Integration](/docs/integrations/horizon)
