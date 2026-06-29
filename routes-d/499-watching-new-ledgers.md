---
title: Watching New Ledgers
description: How to watch Stellar ledger closes with Horizon streaming or polling in long-running services
---

# Watching New Ledgers

Long-running services often need to react whenever Stellar closes a new ledger. Use ledger watching for indexers, notification workers, reconciliation jobs, freshness checks, and systems that need to resume work after downtime.

Stellar ledgers usually close about every 5 seconds, but production code should tolerate slower closes, connection drops, rate limits, and service restarts.

---

## Choose a Strategy

| Strategy              | Best for                                                    | Trade-off                                          |
| --------------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| Horizon streaming     | Near real-time workers and indexers                         | Requires reconnect handling and cursor persistence |
| Polling latest ledger | Simple background jobs, health checks, constrained runtimes | More requests and slightly higher latency          |

Use streaming when you need prompt updates and can keep a long-lived connection open. Use polling when the runtime does not handle server-sent events well, such as short-lived jobs, serverless functions, or restrictive network environments.

---

## Streaming with Horizon

Horizon supports server-sent events on collection endpoints, including `/ledgers`. In the JavaScript SDK, call `stream()` on the ledgers request.

Start with `cursor("now")` when you only care about ledgers that close after the process starts:

```js
import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

const close = server
  .ledgers()
  .cursor('now')
  .stream({
    onmessage: (ledger) => {
      console.log('closed ledger', ledger.sequence, ledger.closed_at);
    },
    onerror: (error) => {
      console.error('ledger stream error', error);
    },
  });

// Later, during shutdown:
close();
```

For durable workers, persist the last processed ledger sequence. After a restart, stream from that sequence instead of `now`, then de-duplicate the first record if it has already been processed.

---

## Polling the Latest Ledger

Polling is straightforward: request the newest ledger in descending order, compare it to the last processed sequence, and process any missing range.

```js
import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function latestLedgerSequence() {
  const page = await server.ledgers().order('desc').limit(1).call();
  return Number(page.records[0].sequence);
}

async function watchLedgers(processLedger) {
  let lastProcessed = await latestLedgerSequence();
  let failures = 0;

  while (true) {
    try {
      const latest = await latestLedgerSequence();

      for (let sequence = lastProcessed + 1; sequence <= latest; sequence++) {
        await processLedger(sequence);
        lastProcessed = sequence;
      }

      failures = 0;
      await sleep(5000);
    } catch (error) {
      failures += 1;
      const delay = Math.min(30000, 1000 * 2 ** failures);
      const jitter = Math.floor(Math.random() * 500);
      console.error('ledger polling failed', error);
      await sleep(delay + jitter);
    }
  }
}

await watchLedgers(async (sequence) => {
  console.log('process ledger', sequence);
});
```

This pattern avoids skipping ledgers when the process sleeps through multiple closes. Store `lastProcessed` outside the process, such as in a database row, if duplicate processing matters.

---

## Backoff and Recovery

Treat both streaming and polling as best-effort transport:

- Persist the last processed ledger sequence after work for that ledger succeeds.
- Use exponential backoff with jitter after network errors, `429`, `500`, `503`, or `504` responses.
- Cap backoff so the worker eventually checks again, for example at 30-60 seconds.
- On restart, backfill from the persisted cursor before listening for new ledgers.
- Make per-ledger work idempotent so retrying the same sequence is safe.

For streaming workers, reconnect after errors and resume from the last processed ledger. For polling workers, compare the latest sequence with the stored sequence and process every missing ledger in ascending order.

---

## Operational Notes

- Keep the poll interval near the ledger cadence only when low latency matters. A 5-10 second interval is enough for most jobs.
- Do not run tight loops against public Horizon endpoints. Respect rate limits and share one watcher per service when possible.
- Watch Testnet resets separately. Testnet ledger state and history are periodically cleared.
- If you need guaranteed historical replay, pair the watcher with a persistent cursor and paginated Horizon reads.

**Related:** [Latest Ledger Streaming](/routes-d/481-latest-ledger-streaming), [Ledger Close Times](/routes-d/457-ledger-close-times), [Horizon Query Parameters](/routes-d/508-horizon-query-parameters)
