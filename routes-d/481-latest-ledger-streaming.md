---
title: Latest Ledger Streaming
description: How to subscribe to the Stellar latest-ledger stream via Horizon SSE and handle reconnects
---

# Latest Ledger Streaming

Horizon exposes a server-sent events (SSE) endpoint that pushes a message every time a new ledger closes on the Stellar network. Use it to stay in sync with the chain without polling.

---

## Subscription Setup

Call the `/ledgers` endpoint with `cursor=now` to receive only ledgers that close after you connect:

```js
import { Horizon } from "@stellar/stellar-sdk";

const server = new Horizon.Server("https://horizon-testnet.stellar.org");

const close = server
  .ledgers()
  .cursor("now")
  .stream({
    onmessage: (ledger) => {
      console.log("New ledger:", ledger.sequence, ledger.closed_at);
    },
    onerror: (err) => {
      console.error("Stream error:", err);
    },
  });

// Call close() to stop listening
```

---

## Reconnect Behavior

The Stellar SDK automatically reconnects when the SSE connection drops. On reconnect it resumes from the last received ledger sequence, so no ledgers are skipped. If you manage the connection manually, store the last `sequence` value and pass it as the new cursor:

```js
let lastSequence = "now";

function startStream() {
  return server
    .ledgers()
    .cursor(lastSequence)
    .stream({
      onmessage: (ledger) => {
        lastSequence = ledger.sequence;
        // process ledger ...
      },
      onerror: () => {
        setTimeout(startStream, 2000); // manual reconnect after 2 s
      },
    });
}
```

---

## Notes

- Each ledger closes roughly every **5 seconds** on Mainnet and Testnet.
- The `cursor=now` value tells Horizon to skip historical ledgers and start from the current tip.
- Long-lived streams will eventually be interrupted by network conditions; always handle `onerror`.

**Related:** [Horizon Integration](/docs/integrations/horizon), [Glossary](/docs/guides/glossary)
