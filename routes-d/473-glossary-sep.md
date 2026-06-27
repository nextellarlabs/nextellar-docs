---
title: 'Glossary: SEP'
description: Short definition of SEP (Stellar Ecosystem Proposal) and where to find the published standards
---

# Glossary: SEP

**SEP** stands for **Stellar Ecosystem Proposal** — the specification process used to define interoperability standards across applications, wallets, anchors, and other services built on Stellar.

---

## What SEPs Cover

SEPs describe protocols that multiple parties must implement consistently to work together. Common examples include:

| SEP    | Topic                                                                      |
| ------ | -------------------------------------------------------------------------- |
| SEP-1  | `stellar.toml` — machine-readable metadata for Stellar accounts and assets |
| SEP-10 | Stellar Web Authentication — wallet-based sign-in                          |
| SEP-24 | Hosted Deposit and Withdrawal — anchor interactive flows                   |
| SEP-31 | Cross-Border Payments — direct payment API for sending parties             |

---

## Where SEPs Are Published

The full SEP index is maintained in the `stellar/stellar-protocol` repository on GitHub:

**[github.com/stellar/stellar-protocol/tree/master/ecosystem](https://github.com/stellar/stellar-protocol/tree/master/ecosystem)**

Each SEP is a Markdown file in that folder. Proposed SEPs start as drafts; finalized SEPs carry a `Status: Final` header.

---

## Notes

- SEPs are ecosystem conventions, not protocol upgrades. They do not require changes to validators or the core Stellar protocol.
- Core protocol changes follow a separate track called **CAPs** (Core Advancement Proposals).

**Related:** SEP-1, SEP-10, SEP-24, anchor, `stellar.toml`, CAP

**Related docs:** [Integrations](/docs/integrations), [Glossary](/docs/guides/glossary)
