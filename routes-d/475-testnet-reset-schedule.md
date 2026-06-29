---
title: Testnet Reset Schedule
description: Short reference for Stellar Testnet reset cadence and behavior
---

# Testnet Reset Schedule

Stellar Testnet is reset periodically so the network stays small, useful, and quick for developers to sync. Do not treat Testnet accounts, balances, contracts, offers, or historical data as persistent.

---

## Reset Cadence

Testnet resets typically happen **2-4 times per year** at **17:00 UTC**. SDF announces scheduled resets at least two weeks in advance on the [Stellar Dashboard](https://dashboard.stellar.org/) and through developer community channels.

The Stellar network documentation lists the scheduled 2026 Testnet reset date as **December 16, 2026**.

---

## What Happens During a Reset

A reset returns Testnet to the genesis ledger and clears network data, including:

- Accounts and balances
- Trustlines, offers, and liquidity pool state
- Smart contract instances and contract storage
- Transactions and historical data served by Stellar Core, Horizon, and Stellar RPC

After a reset, recreate test accounts with Friendbot and rerun any scripts that issue assets, create trustlines, deploy contracts, or seed application test data.

---

## Where to Confirm the Schedule

Before planning work around Testnet state, check the [Stellar Dashboard](https://dashboard.stellar.org/) and the [Stellar Networks documentation](https://developers.stellar.org/docs/networks#testnet-and-futurenet-data-reset) for the latest reset announcements.

**Related:** [Friendbot Rate Limits](/routes-d/465-friendbot-rate-limits), [Ledger Close Times](/routes-d/457-ledger-close-times)
