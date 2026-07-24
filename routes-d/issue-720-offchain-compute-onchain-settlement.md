---
title: Off-Chain Compute with On-Chain Settlement
description: A comprehensive guide to running heavy computation off-chain while settling results on Stellar, covering trust models, the settlement flow, and a reference batch-payout example
---

# Off-Chain Compute with On-Chain Settlement

Ledgers are good at ordering, authorization, and final settlement — and bad at heavy computation. The standard answer is to compute off-chain and settle on-chain: run the expensive logic on ordinary servers, then commit only the _result_ to Stellar where it becomes authoritative and auditable. This guide covers the trust models available, the settlement flow, and a reference implementation for a batch payout system.

---

## Table of Contents

1. [When to Use This Pattern](#when-to-use-this-pattern)
2. [The Trust Model](#the-trust-model)
3. [The Settlement Flow](#the-settlement-flow)
4. [Reference Example: Batch Payouts](#reference-example-batch-payouts)
5. [Failure Handling](#failure-handling)
6. [Auditability](#auditability)
7. [Choosing a Trust Level](#choosing-a-trust-level)

---

## When to Use This Pattern

Reach for off-chain compute when the logic is too expensive, too private, or too data-hungry to run in a Soroban contract:

- **Aggregation** — computing payouts, rewards, interest, or rankings across thousands of accounts.
- **Matching** — order matching, auction clearing, routing.
- **External data** — anything that needs web APIs, ML inference, or large datasets.
- **Privacy** — inputs that must not appear on a public ledger (salaries, KYC attributes).

The ledger's role shrinks to three things it does perfectly: hold funds, verify authorization, and record the final state transition.

---

## The Trust Model

Everything in this pattern hinges on one question: **why should anyone believe the off-chain result?** There are four broad answers, in increasing order of machinery:

### 1. Trusted operator

The computing party is simply trusted (it is your own backend, or a contractual counterparty). Settlement is a normal transaction signed by the operator's key.

- Verification cost: none. Trust required: total.
- Right for: internal systems, payroll, single-company products — the majority of real deployments.

### 2. Multi-party attestation (M-of-N)

Several independent parties run the same computation; settlement requires M-of-N signatures. On Stellar this maps directly onto native multisig: set signer weights and thresholds on the settlement account, or require multiple `require_auth` addresses in a Soroban contract.

- Verification cost: running N replicas. Trust required: that M parties don't collude.
- Right for: consortiums, bridges, oracle committees.

### 3. Optimistic settlement (challenge window)

One party posts the result along with a bond; anyone can challenge within a window by submitting proof of a wrong result. Unchallenged results finalize; successful challenges slash the bond.

- Verification cost: only on dispute. Trust required: at least one honest watcher exists.
- Right for: high-value results where independent parties have an incentive to watch.

### 4. Validity proofs (zk)

The off-chain computation produces a cryptographic proof that the result is correct; the contract verifies the proof before accepting settlement.

- Verification cost: proof generation is heavy; verification is cheap. Trust required: none beyond the cryptography.
- Right for: cases that justify significant engineering investment; proving general computation remains expensive.

> Start with the weakest trust model your users will accept. Each step up the ladder multiplies engineering cost, and a trusted-operator design with good auditability (below) is often more honest than a half-finished optimistic scheme.

---

## The Settlement Flow

The flow is the same regardless of trust model — only the "verify" step changes:

```
   Off-chain worker                     Stellar / Soroban
        |                                     |
 1. read inputs (DB, APIs,                    |
    ledger snapshots)                         |
        |                                     |
 2. compute result                            |
    result_hash = H(result)                   |
        |                                     |
 3. ------- submit(result, result_hash) ----> |
        |                              4. verify authorization
        |                                 (operator sig / M-of-N /
        |                                  challenge window / proof)
        |                              5. execute state change
        |                                 (transfers, storage writes)
        |                              6. emit settlement event
        | <------- tx hash, events ---------- |
 7. reconcile: confirm on-ledger              |
    state matches computed result             |
```

Two rules make this robust:

- **Commit to the inputs.** Record which ledger sequence / data snapshot the computation used, and include it (or its hash) in the settlement. Without this, "recompute to verify" is meaningless because inputs drift.
- **Make settlement idempotent.** The settlement transaction must be safe to submit twice. Use a batch identifier stored on-chain: settling an already-settled batch ID must fail cleanly.

---

## Reference Example: Batch Payouts

A creator platform computes weekly revenue shares for thousands of creators off-chain, then settles the batch on Stellar. Trusted-operator model, with hashes committed for auditability.

**Off-chain worker (TypeScript):**

```ts
import { createHash } from 'node:crypto';

interface Payout {
  destination: string; // G... address
  amountXlm: string; // fixed 7-decimal string
}

async function computeBatch(
  weekId: string
): Promise<{ payouts: Payout[]; batchHash: string }> {
  // 1. Snapshot inputs: revenue events up to a fixed cutoff ledger.
  const cutoffLedger = await getWeekCutoffLedger(weekId);
  const events = await db.revenueEvents.where({
    weekId,
    maxLedger: cutoffLedger,
  });

  // 2. Heavy computation happens here, in ordinary code you can test.
  const payouts = aggregateRevenueShares(events);

  // 3. Commit to the result: canonical serialization, then hash.
  const canonical = JSON.stringify(
    payouts.map((p) => [p.destination, p.amountXlm]).sort()
  );
  const batchHash = createHash('sha256').update(canonical).digest('hex');

  return { payouts, batchHash };
}
```

**Settlement contract (Soroban, abbreviated):**

```rust
pub fn settle_batch(
    env: Env,
    operator: Address,
    batch_id: Symbol,
    batch_hash: BytesN<32>,
    payouts: Vec<(Address, i128)>,
) {
    operator.require_auth();

    // Idempotency: each batch settles exactly once.
    if env.storage().persistent().has(&batch_id) {
        panic_with_error!(&env, Error::BatchAlreadySettled);
    }

    // Execute the transfers from the pool held by this contract.
    let token = token::Client::new(&env, &read_payout_token(&env));
    for (dest, amount) in payouts.iter() {
        token.transfer(&env.current_contract_address(), &dest, &amount);
    }

    // Record the commitment; auditors can recompute and compare.
    env.storage().persistent().set(&batch_id, &batch_hash);
    env.events().publish((symbol_short!("settled"), batch_id), batch_hash);
}
```

For payout counts beyond what fits in one transaction, split into chunks with ids `week-42-chunk-0..n` — each chunk idempotent on its own — and store the parent batch hash in every chunk so partial settlement is detectable.

> On classic Stellar (no Soroban), the same design works with a payment-op batch from a multisig-controlled distribution account, with `batch_id` carried in the transaction memo.

---

## Failure Handling

- **Worker crash before submit:** nothing settled; rerun the computation. Determinism (fixed input snapshot) guarantees the same result and hash.
- **Transaction failed:** distinguish _rejected_ (fix and resubmit — same batch ID keeps it safe) from _unknown outcome_ (timeout). For unknown outcomes, query the ledger for the batch ID before resubmitting — never blind-retry a settlement.
- **Partial chunk settlement:** on restart, read which chunk IDs exist on-chain and resume from the first missing one.
- **Result disputed after settlement:** with a trusted operator, this is an off-chain process (recompute from the committed input snapshot, publish the diff, issue a correcting batch). Never mutate a settled batch; append a correction with its own ID.

---

## Auditability

Even in the trusted-operator model, you can make the system _verifiable after the fact_ at almost no cost:

1. **Publish input snapshots** (or their hashes) alongside each batch.
2. **Commit the result hash on-chain** at settlement time, as in the example.
3. **Keep the computation deterministic and open** — a third party who obtains the inputs can recompute and compare against the on-chain hash.

This turns "trust me" into "trust, but verify with a script", which is a meaningful upgrade for users and a forcing function for your own engineering discipline.

---

## Choosing a Trust Level

| Situation                                      | Recommended model                       |
| ---------------------------------------------- | --------------------------------------- |
| Your own product paying your own users         | Trusted operator + committed hashes     |
| Consortium of known parties                    | M-of-N attestation via Stellar multisig |
| Open system, watchful third parties exist      | Optimistic with bonded challenges       |
| Adversarial environment, high value per result | Validity proofs                         |

Settle the smallest thing that makes the result final — usually a set of transfers and one hash — and keep everything else off-chain where it is cheap to compute, easy to test, and possible to fix.
