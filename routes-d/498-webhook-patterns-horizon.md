---
title: Webhook Patterns over Horizon
description: How to fan out Horizon SSE updates to HTTP webhooks, delivery guarantees, and a small bridge-service example
---

# Webhook Patterns over Horizon

Horizon exposes real-time ledger data through server-sent events (SSE) on collection endpoints such as `/payments`, `/transactions`, `/effects`, and `/ledgers`. Most backend services, however, expect plain HTTP webhooks. A small bridge layer between Horizon streams and your webhook consumers is the standard pattern for turning on-chain activity into application events.

---

## The Fan-Out Pattern

```
Horizon SSE  →  Bridge service  →  Webhook subscribers
(payments)      (filter + queue)     (HTTPS POST endpoints)
```

The bridge service:

1. Opens one or more long-lived Horizon SSE connections (typically one stream per watched account or contract).
2. Normalizes each event into a stable JSON payload.
3. Matches the event against subscriber rules (account, asset, operation type).
4. Delivers matching events to registered webhook URLs with retries and idempotency keys.

This keeps Horizon connection count low while allowing many downstream consumers.

---

## Horizon Streams to Bridge

```js
import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon.stellar.org');

function watchPayments(accountId, onEvent) {
  return server
    .payments()
    .forAccount(accountId)
    .cursor('now')
    .stream({
      onmessage: (payment) => {
        onEvent({
          id: payment.id,
          type: payment.type,
          account: payment.to ?? payment.from,
          asset: payment.asset_type === 'native' ? 'XLM' : payment.asset_code,
          amount: payment.amount,
          txHash: payment.transaction_hash,
          ledger: payment.ledger,
        });
      },
      onerror: (err) => console.error('SSE error:', err),
    });
}
```

Use `cursor=now` to skip historical records. Persist the last `paging_token` (or ledger sequence) so the bridge can resume after restarts without replaying the full history.

---

## Webhook Delivery

```js
async function deliverWebhook(subscriber, event) {
  const idempotencyKey = `${event.txHash}:${event.id}`;

  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(subscriber.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Id': idempotencyKey,
        'X-Webhook-Signature': signPayload(subscriber.secret, event),
      },
      body: JSON.stringify({ event: 'payment.received', data: event }),
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok) return;
    await sleep(2 ** attempt * 1000); // 1 s, 2 s, 4 s backoff
  }

  await deadLetterQueue.push({ subscriber, event, idempotencyKey });
}
```

Subscribers should verify the HMAC signature and deduplicate on `X-Webhook-Id`.

---

## Delivery Guarantees

| Guarantee                           | Reality                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| **At-least-once delivery**          | Yes, with retries — subscribers may receive duplicates                                     |
| **Exactly-once**                    | No — design handlers to be idempotent                                                      |
| **Ordering**                        | Per-stream ordering is roughly ledger order, but reconnects can replay or skip during gaps |
| **Latency**                         | Typically within one ledger close (~5 s) plus bridge processing time                       |
| **Durability while bridge is down** | No — events missed during downtime are lost unless you backfill from Horizon REST          |

Horizon SSE is a **best-effort push channel**, not a durable message bus. For guaranteed replay across outages, persist cursors and backfill gaps with paginated REST queries (`order=asc`, cursor-based pagination) before resuming the stream.

---

## Small Example: Multi-Subscriber Bridge

```js
import { Horizon } from '@stellar/stellar-sdk';

const subscribers = [
  {
    url: 'https://api.example.com/hooks/treasury',
    accounts: ['GABC...'],
    secret: 'whsec_...',
  },
  {
    url: 'https://billing.example.com/stellar',
    accounts: ['GABC...', 'GDEF...'],
    secret: 'whsec_...',
  },
];

const server = new Horizon.Server('https://horizon.stellar.org');

function matchesSubscriber(payment, sub) {
  return (
    sub.accounts.includes(payment.to) || sub.accounts.includes(payment.from)
  );
}

function startBridge(watchedAccount) {
  return server
    .payments()
    .forAccount(watchedAccount)
    .cursor('now')
    .stream({
      onmessage: async (payment) => {
        const normalized = {
          id: payment.id,
          type: payment.type,
          from: payment.from,
          to: payment.to,
          amount: payment.amount,
          asset: payment.asset_type,
          txHash: payment.transaction_hash,
        };

        await Promise.all(
          subscribers
            .filter((sub) => matchesSubscriber(payment, sub))
            .map((sub) => deliverWebhook(sub, normalized))
        );
      },
    });
}

startBridge('GABC...');
```

Run one SSE connection per watched account (or merge filters in the bridge) rather than opening a connection per webhook subscriber.

---

## Notes

- Rate-limit outbound webhook calls so a burst of ledger activity does not overwhelm downstream services.
- Separate **operational** streams (payments to your treasury) from **analytics** streams (all contract events) — they have different durability and filtering needs.
- For Soroban contract events, combine Horizon payment/transaction streams with a dedicated indexer when you need historical queries or complex filters.

**Related:** [Latest Ledger Streaming](/routes-d/481-latest-ledger-streaming), [Transaction Observability](/docs/guides/transaction-observability), [Horizon Integration](/docs/integrations/horizon)
