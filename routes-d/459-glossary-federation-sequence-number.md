---
title: 'Glossary: Federation and Sequence Number'
description: Short definitions for Federation and Sequence Number as used in the Stellar network and Nextellar docs
---

# Glossary: Federation and Sequence Number

Two terms that appear frequently when building on Stellar.

---

## Federation

A Stellar protocol that maps a short human-readable address (like `alice*example.com`) to a full public key. Instead of sharing a 56-character key, users share a federated address. The resolving client looks up the domain's `stellar.toml` to find the federation server, then queries it for the matching account ID.

**Common usage:** wallets and payment UIs accept federated addresses and resolve them transparently before submitting a transaction.

**Related:** federation server, `stellar.toml`, public key

---

## Sequence Number

A monotonically increasing counter stored on every Stellar account. Each transaction submitted from an account must include the current sequence number plus one. After the transaction is applied the ledger increments the counter, preventing replay attacks and ensuring transaction ordering.

**Common usage:** if you try to submit two transactions built from the same base sequence number, the second will fail with `tx_bad_seq`. Always reload the account from Horizon to get the latest sequence number before building a new transaction.

**Related:** account, ledger, `tx_bad_seq`, nonce

**Related docs:** [Horizon Integration](/docs/integrations/horizon)
