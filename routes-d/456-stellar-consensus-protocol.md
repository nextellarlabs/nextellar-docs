---
title: Stellar Consensus Protocol (SCP)
description: A plain-language introduction to SCP, its role in Stellar network operation, and links to authoritative sources
---

# Stellar Consensus Protocol (SCP)

SCP is the federated Byzantine agreement algorithm that Stellar validators use to agree on the contents and order of each ledger. It is how the network reaches finality without a central authority.

---

## How It Works in Plain Terms

Instead of a single authoritative party (or a computationally expensive proof-of-work race), each Stellar validator declares a **quorum slice** — a set of other validators it trusts enough to rely on when forming consensus. Consensus emerges when overlapping slices across the network converge on the same ledger state.

The key properties SCP provides:

- **Safety:** Nodes will not commit conflicting values — two honest nodes that reach finality will always agree on the same ledger.
- **Liveness:** As long as enough trusted validators are online, the network continues to close ledgers (~every 5 seconds).
- **Decentralization:** No single entity controls consensus; any participant can choose its own trust set.

---

## Role in Network Operation

When you submit a transaction to Horizon, it is broadcast to validators. Each validator runs SCP rounds to nominate, prepare, and commit a ledger containing that transaction. Once a quorum of validators commits, the ledger is closed and the transaction is final — no reversals are possible.

This finality is fast (seconds) and does not require confirmations in the Bitcoin sense; one closed ledger is sufficient.

---

## Authoritative Sources

- **SCP Whitepaper:** [Stellar Consensus Protocol (academic paper)](https://www.stellar.org/papers/stellar-consensus-protocol)
- **SDF Developer Docs:** [https://developers.stellar.org/docs/learn/fundamentals/stellar-consensus-protocol](https://developers.stellar.org/docs/learn/fundamentals/stellar-consensus-protocol)

**Related:** [Glossary: Validator](/routes-d/458-glossary-stroop-validator), [Ledger Close Times](/routes-d/457-ledger-close-times)
