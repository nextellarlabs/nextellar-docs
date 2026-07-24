---
title: Background Job Processing for Stellar Applications
description: A comprehensive guide to running background jobs that touch the Stellar network, covering queue design, retry strategies, idempotent transaction submission, and a worked payment-worker example
---

# Background Job Processing for Stellar Applications

Anything slow, failure-prone, or bursty belongs in a background job, not a request handler — and almost everything that touches the Stellar network is at least one of those. This guide covers queue design, retry strategy, and the property that makes or breaks ledger-touching jobs: idempotency. It ends with a small, complete payment worker.

---

## Table of Contents

1. [Why Jobs, Not Request Handlers](#why-jobs-not-request-handlers)
2. [Queue Design](#queue-design)
3. [Retries](#retries)
4. [Idempotency](#idempotency)
5. [A Small Example: Payment Worker](#a-small-example-payment-worker)
6. [Observability](#observability)
7. [Checklist](#checklist)

---

## Why Jobs, Not Request Handlers

A payment submission can take several seconds (build, sign, submit, await inclusion), can fail transiently (network, fee surge, sequence collision), and can arrive in bursts. Doing it inline in an HTTP handler couples your user's request latency to ledger close times and turns every transient failure into a user-facing error.

The job pattern decouples them:

```
 HTTP request                Queue                    Worker
     |                         |                        |
     |-- enqueue(payment) ---> |                        |
     |<- 202 Accepted, job id  |                        |
     |                         |--- lease job --------> |
     |                         |                        |-- submit to Stellar
     |                         |                        |-- record result
     |                         |<-- ack / fail -------- |
     |-- GET /jobs/:id ------------------------------->  status: succeeded
```

The user gets an immediate acknowledgment and polls (or receives a webhook/stream) for the outcome.

---

## Queue Design

Any real queue works — BullMQ (Redis), pg-boss (Postgres), SQS, Cloud Tasks. What matters is the properties you configure, not the brand:

- **At-least-once delivery.** Assume every job can run more than once. (This is why idempotency gets its own section.)
- **Per-job leases with visibility timeout.** A crashed worker's job must return to the queue automatically.
- **A dead-letter queue (DLQ).** Jobs that exhaust retries must land somewhere a human can inspect, not vanish.
- **Concurrency limits per source account.** Stellar transactions from one account are ordered by sequence number; two workers submitting concurrently from the same account will collide. Either give each worker its own channel account, or serialize jobs per account with a queue group/partition key.

> **Channel accounts** are the standard Stellar answer to submission concurrency: a pool of funded accounts used only for sequence numbers, with the payment's `source` set per-operation. Partition jobs across channels and each channel stays strictly serial.

---

## Retries

### What to retry

Classify failures before writing retry code:

| Failure                                | Class           | Action                                 |
| -------------------------------------- | --------------- | -------------------------------------- |
| Network timeout to Horizon/RPC         | Transient       | Retry with backoff                     |
| `tx_insufficient_fee` during surge     | Transient       | Retry with bumped fee                  |
| `tx_bad_seq` (sequence collision)      | Transient       | Refresh sequence, rebuild, retry       |
| Timebounds expired                     | Transient       | Rebuild transaction, retry             |
| `op_underfunded` (payer lacks balance) | Permanent       | Fail the job; notify                   |
| `op_no_destination` (account missing)  | Permanent       | Fail or route to account-creation flow |
| Malformed request / bad address        | Permanent (bug) | DLQ immediately, alert                 |

Retrying permanent failures wastes time at best; at worst (see below) it double-pays.

### How to retry

- **Exponential backoff with jitter:** e.g. `delay = min(cap, base * 2^attempt) * random(0.5, 1.5)`. Jitter prevents synchronized retry storms after an outage.
- **Cap attempts** (5–8 is typical) and route exhausted jobs to the DLQ.
- **The dangerous window:** a timeout does _not_ mean the transaction failed — it may be in the ledger already. **Never blind-retry after an unknown outcome.** Resolve the outcome first (next section).

---

## Idempotency

At-least-once delivery plus money movement means one thing: every job must be safe to run twice. Three layers achieve this:

1. **Job-level idempotency key.** Every logical operation gets a unique key (`payout-2026-07-invoice-8841`) stored with a unique constraint. A duplicate enqueue becomes a no-op.

2. **Ledger-level deduplication.** Before submitting, and after any unknown outcome, check whether the transaction already made it:
   - Deterministically rebuild the same transaction envelope (same source, sequence, operations, memo) and look up its hash, or
   - Query for the idempotency key carried in the transaction **memo** (classic) or in a contract event (Soroban).

3. **State-machine guard in your database.** Track each job through `pending → submitting → submitted → confirmed | failed`. Transitions are compare-and-swap updates; a second worker that loads a job already in `submitted` verifies instead of resubmitting.

```
pending --> submitting --> submitted --> confirmed
                |              |
                |              +--> unknown --(query ledger)--> confirmed | retry
                +--> failed (permanent)
```

---

## A Small Example: Payment Worker

A BullMQ worker that pays out XLM with idempotency and correct retry classification:

```ts
import { Worker } from 'bullmq';
import {
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Networks,
  Memo,
} from '@stellar/stellar-sdk';

const horizon = new Horizon.Server('https://horizon.stellar.org');

const worker = new Worker(
  'payouts',
  async (job) => {
    const { idempotencyKey, destination, amountXlm } = job.data;

    // Layer 3: state-machine guard (atomic claim).
    const claimed = await db.claimJob(idempotencyKey); // UPDATE ... WHERE state='pending'
    if (!claimed) {
      return await verifyOutcome(idempotencyKey); // someone already ran it
    }

    // Layer 2: did a previous attempt land on-ledger?
    const existing = await findPaymentByMemo(horizon, idempotencyKey);
    if (existing) {
      await db.markConfirmed(idempotencyKey, existing.transaction_hash);
      return;
    }

    const channel = await channelPool.acquire(); // per-account serialization
    try {
      const account = await horizon.loadAccount(channel.publicKey);
      const tx = new TransactionBuilder(account, {
        fee: await recommendedFee(horizon),
        networkPassphrase: Networks.PUBLIC,
      })
        .addOperation(
          Operation.payment({
            source: channel.publicKey,
            destination,
            asset: Asset.native(),
            amount: amountXlm,
          })
        )
        .addMemo(Memo.text(idempotencyKey.slice(0, 28))) // memo carries the key
        .setTimeout(60)
        .build();

      tx.sign(channel.keypair);
      await db.markSubmitted(idempotencyKey, tx.hash().toString('hex'));

      const res = await horizon.submitTransaction(tx);
      await db.markConfirmed(idempotencyKey, res.hash);
    } catch (err) {
      if (isUnknownOutcome(err)) {
        // Timeout: may or may not be in the ledger. Do NOT rethrow blindly —
        // requeue a verification, not a resubmission.
        await job.moveToDelayed(Date.now() + 15_000);
        return;
      }
      if (isPermanent(err)) {
        await db.markFailed(idempotencyKey, describeStellarError(err));
        return; // do not rethrow: no retry for permanent failures
      }
      throw err; // transient: let BullMQ's backoff retry it
    } finally {
      channelPool.release(channel);
    }
  },
  {
    connection: redis,
    concurrency: 8,
    settings: {},
  }
);
```

Queue configuration to match:

```ts
await queue.add('payout', data, {
  jobId: data.idempotencyKey, // layer 1: dedupe at enqueue
  attempts: 6,
  backoff: { type: 'exponential', delay: 2_000 },
  removeOnComplete: 1000,
  removeOnFail: false, // keep failures inspectable
});
```

The three idempotency layers are doing distinct work: `jobId` stops duplicate enqueues, the DB state machine stops concurrent double-runs, and the memo lookup stops double-submission after an unknown outcome. Remove any one and there is a sequence of crashes that double-pays.

---

## Observability

- **Metrics:** queue depth, job age (p95 time-to-confirmed), retry rate, DLQ arrivals, per-error-code counts. A rising `tx_insufficient_fee` rate is your early fee-surge alarm.
- **Structured logs** with the idempotency key on every line, so one grep reconstructs any payment's history.
- **Alerts** on DLQ arrivals (a human decision is needed) and on queue age breaching SLO — not on individual transient failures, which are routine.

---

## Checklist

- [ ] Every ledger-touching operation runs in a job, not a request handler.
- [ ] Delivery is at-least-once, with a visibility timeout and a DLQ.
- [ ] Jobs from the same source account are serialized (or channel accounts are used).
- [ ] Failures are classified; permanent errors do not retry.
- [ ] Backoff is exponential with jitter and an attempt cap.
- [ ] Unknown outcomes trigger ledger verification, never blind resubmission.
- [ ] Idempotency exists at all three layers: enqueue, state machine, ledger.
- [ ] DLQ arrivals page a human; transient retries do not.
