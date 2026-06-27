---
title: Soroban Event Indexing Strategy
description: An end-to-end strategy for ingesting, storing, and replaying Soroban contract events, including a reference Node.js indexer example
---

# Soroban Event Indexing Strategy

Soroban contracts emit structured events that off-chain systems can consume for analytics, notifications, and audit trails. This guide covers the full lifecycle: ingestion from the RPC, storage schema design, idempotent upserts, and replay from any ledger cursor.

---

## What Soroban Contract Events Are

A Soroban contract emits an event by calling `env.events().publish(topics, data)` inside a contract function. Each event has:

- **Topics** — a vector of up to four `Val` values (typically a `Symbol` tag plus typed discriminators). Topics are encoded as XDR and surfaced as base64 strings by the RPC.
- **Data** — an arbitrary `Val` payload, also XDR-encoded as a base64 string.
- **Metadata** — the emitting `contract_id`, `ledger_sequence`, `transaction_hash`, and an in-transaction `event_index`.

Events are only persisted for a configurable number of ledgers (the _event retention window_). Index them promptly; you cannot fetch events that have aged out.

---

## Ingestion: Polling `getEvents` with Cursor-Based Pagination

The Soroban RPC exposes a `getEvents` method. Use cursor-based pagination to fetch all events without gaps.

```js
import { SorobanRpc } from '@stellar/stellar-sdk';

const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');

/**
 * Fetch all events for a contract starting from a given cursor.
 * Returns the events array and the cursor to use on the next call.
 */
async function fetchEvents(contractId, startCursor, limit = 200) {
  const response = await server.getEvents({
    startLedger: startCursor, // ledger sequence number (number) or paging token (string)
    filters: [
      {
        type: 'contract',
        contractIds: [contractId],
      },
    ],
    limit,
  });

  return {
    events: response.events,
    // latestLedger is safe to use as the next startLedger
    nextCursor: response.latestLedger,
  };
}
```

**Rate limit handling.** Public RPC endpoints enforce request-per-second limits. Add exponential backoff on `429` responses:

```js
async function fetchWithRetry(contractId, cursor, retries = 5) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetchEvents(contractId, cursor);
    } catch (err) {
      if (err?.status === 429 && attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 500; // 500ms, 1s, 2s, 4s …
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}
```

---

## Storage Schema

Store one row per event. The primary key should be `(contract_id, ledger_sequence, event_index)` to guarantee uniqueness across re-index runs.

```sql
CREATE TABLE soroban_events (
  id               BIGSERIAL PRIMARY KEY,
  contract_id      TEXT        NOT NULL,
  ledger_sequence  INTEGER     NOT NULL,
  event_index      INTEGER     NOT NULL,   -- position within the transaction
  transaction_hash TEXT        NOT NULL,
  topic_xdr        TEXT[]      NOT NULL,   -- array of base64-encoded XDR topics
  value_xdr        TEXT        NOT NULL,   -- base64-encoded XDR data payload
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (contract_id, ledger_sequence, event_index)
);

CREATE INDEX ON soroban_events (contract_id, ledger_sequence);
CREATE INDEX ON soroban_events (transaction_hash);
```

For applications that need to query by topic value, store a decoded JSON column alongside the raw XDR:

```sql
ALTER TABLE soroban_events ADD COLUMN topics_json JSONB;
CREATE INDEX ON soroban_events USING gin (topics_json);
```

---

## Tracking Indexer Progress

Keep a separate table (or key-value store) to record the last successfully processed ledger per contract:

```sql
CREATE TABLE indexer_cursors (
  contract_id      TEXT    PRIMARY KEY,
  last_ledger      INTEGER NOT NULL,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

On startup, read `last_ledger` and resume from `last_ledger + 1`. On shutdown or crash, the next run picks up from the last committed ledger — no events are skipped.

---

## Idempotent Upserts

Because network errors or restarts can cause the same ledger to be fetched twice, always upsert using the unique constraint:

```js
async function upsertEvent(db, event) {
  await db.query(
    `INSERT INTO soroban_events
       (contract_id, ledger_sequence, event_index, transaction_hash, topic_xdr, value_xdr)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (contract_id, ledger_sequence, event_index) DO NOTHING`,
    [
      event.contractId,
      event.ledger,
      event.eventIndex,
      event.txHash,
      event.topic.map((t) => t.toXDR('base64')),
      event.value.toXDR('base64'),
    ]
  );
}
```

---

## Replay Strategy

To re-index from an earlier ledger (e.g. after a schema migration or bug fix):

1. Set `last_ledger` for the contract to the desired start ledger minus one.
2. Delete or archive rows with `ledger_sequence >= desired_start_ledger` from `soroban_events`.
3. Restart the indexer — it will pick up from the updated cursor.

Because upserts are idempotent, partial replays are safe. If only a subset of columns need to change, use `ON CONFLICT ... DO UPDATE SET` instead of `DO NOTHING`.

---

## Reference Example: Minimal Node.js Indexer

```js
import { SorobanRpc, xdr } from '@stellar/stellar-sdk';
import pg from 'pg';

const server = new SorobanRpc.Server('https://soroban-testnet.stellar.org');
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const CONTRACT_ID = 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const POLL_INTERVAL_MS = 6_000; // ~1 ledger close on testnet

async function getLastLedger() {
  const { rows } = await db.query(
    'SELECT last_ledger FROM indexer_cursors WHERE contract_id = $1',
    [CONTRACT_ID]
  );
  // Default: start from 5 ledgers ago as a safe bootstrap margin
  return rows[0]?.last_ledger ?? (await server.getLatestLedger()).sequence - 5;
}

async function setLastLedger(ledger) {
  await db.query(
    `INSERT INTO indexer_cursors (contract_id, last_ledger)
     VALUES ($1, $2)
     ON CONFLICT (contract_id) DO UPDATE SET last_ledger = $2, updated_at = NOW()`,
    [CONTRACT_ID, ledger]
  );
}

async function runOnce() {
  const startLedger = (await getLastLedger()) + 1;
  const { events, nextCursor } = await fetchEvents(CONTRACT_ID, startLedger);

  for (const event of events) {
    await upsertEvent(db, {
      contractId: event.contractId.contractId(),
      ledger: event.ledger,
      eventIndex: event.eventIndex ?? 0,
      txHash: event.txHash,
      topic: event.topic,
      value: event.value,
    });
  }

  if (events.length > 0) {
    await setLastLedger(nextCursor);
    console.log(`Indexed ${events.length} events up to ledger ${nextCursor}`);
  }
}

(async () => {
  while (true) {
    try {
      await runOnce();
    } catch (err) {
      console.error('Indexer error:', err.message);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
})();
```

---

## Notes

- Events older than the RPC retention window (~17 days on mainnet by default) cannot be retrieved. Bootstrap new indexers promptly after contract deployment.
- Decode `topic_xdr` values with `xdr.ScVal.fromXDR(topicBase64, "base64")` to extract typed Soroban values for filtering or display.
- For high-throughput contracts, batch inserts across events in the same poll cycle before committing the cursor update.

**Related:** [Soroban Integration](/docs/integrations/soroban), [Horizon Integration](/docs/integrations/horizon), [Transaction Observability](/routes-d/transaction-observability)
