---
title: Ledger Close Times
description: Typical ledger close cadence on Stellar Mainnet and Testnet, and conditions that cause variability
---

# Ledger Close Times

Stellar closes a new ledger approximately every **5 seconds** on both Mainnet and Testnet under normal conditions. This cadence is set by the consensus protocol — validators negotiate and commit each ledger round in that window.

---

## Typical Cadence

| Network | Typical close time |
| ------- | ------------------ |
| Mainnet | ~5 seconds         |
| Testnet | ~5 seconds         |

Ledger close is near-instant once consensus is reached; the 5-second figure reflects the time between successive ledger closes, not confirmation latency after submission.

---

## Variability Conditions

| Condition                                 | Effect                                                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Validator quorum degraded (nodes offline) | Ledger closes slow or stall until enough validators reconnect                                                     |
| Network partition                         | SCP prioritises safety over liveness — closes halt rather than risk disagreement                                  |
| Surge pricing / high transaction volume   | Individual transactions may wait in the queue across multiple ledgers, but ledger close rate itself is unaffected |
| Testnet resets                            | Testnet is periodically reset; during reset preparation, close times may become irregular                         |

---

## Practical Implications

- **No need to wait multiple confirmations.** One closed ledger means finality.
- **Polling interval:** If you poll Horizon for a transaction, a 5-second interval avoids hammering the server while staying timely.
- **Streaming:** Use Horizon's SSE endpoints to receive ledger or transaction events in real time without polling.

**Related:** [Stellar Consensus Protocol](/routes-d/456-stellar-consensus-protocol), [Latest Ledger Streaming](/routes-d/481-latest-ledger-streaming)
