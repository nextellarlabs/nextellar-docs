---
title: 'Glossary: Stroop and Validator'
description: Short definitions for Stroop and Validator as used in the Stellar network and Nextellar docs
---

# Glossary: Stroop and Validator

Two terms you will see frequently when working with Stellar fees and network consensus.

---

## Stroop

The smallest unit of XLM, equal to one ten-millionth (0.0000001 XLM).

Stellar denominated fees and minimum balances in stroops. For example, the base transaction fee is 100 stroops (0.00001 XLM). When reading fee fields from Horizon, values are returned in stroops.

**Related:** `base_fee`, transaction fee, XLM

---

## Validator

A node that participates in the Stellar Consensus Protocol (SCP) to agree on which transactions are valid and in what order they are applied to the ledger.

Each validator operates independently and casts votes. A transaction reaches finality when a quorum of validators agrees. Nextellar apps connect to Horizon, which itself relies on a network of validators running in the background.

**Related:** Horizon, quorum, Stellar Consensus Protocol (SCP), ledger
