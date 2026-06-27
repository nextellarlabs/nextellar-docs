---
title: Building a Swap UI with Path Payments
description: How to integrate Stellar path payment pathfinding, signing, and submission into a minimal swap interface
---

# Building a Swap UI with Path Payments

Stellar's path payment operations let users swap one asset for another in a single transaction. The DEX finds conversion routes automatically. This guide shows the minimal integration needed to build a working swap UI.

---

## Pathfinding

Before submitting, find the best available path using Horizon's strict-send or strict-receive endpoint:

```js
import { Horizon, Asset } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon.stellar.org');

async function findSwapPaths(sourceAsset, destAsset, sourceAmount) {
  const paths = await server
    .strictSendPaths(sourceAsset, sourceAmount, [destAsset])
    .call();

  // paths.records is sorted by best rate first
  return paths.records;
}

// Example: find paths from USDC to XLM for 10 USDC
const USDC = new Asset(
  'USDC',
  'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'
);
const XLM = Asset.native();

const paths = await findSwapPaths(USDC, XLM, '10');
const bestPath = paths[0];
console.log('Expected to receive:', bestPath.destination_amount, 'XLM');
```

---

## Signing and Submission

Use the best path from pathfinding to build and submit a `PathPaymentStrictSend` operation:

```js
import {
  TransactionBuilder,
  Operation,
  Networks,
  BASE_FEE,
} from '@stellar/stellar-sdk';

async function executeSwap(
  keypair,
  sourceAsset,
  sourceAmount,
  destAsset,
  bestPath
) {
  const account = await server.loadAccount(keypair.publicKey());

  // Accept up to 1% slippage
  const minDestAmount = (
    parseFloat(bestPath.destination_amount) * 0.99
  ).toFixed(7);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.PUBLIC,
  })
    .addOperation(
      Operation.pathPaymentStrictSend({
        sendAsset: sourceAsset,
        sendAmount: sourceAmount,
        destination: keypair.publicKey(), // swap to self
        destAsset,
        destMin: minDestAmount,
        path: bestPath.path.map((p) => new Asset(p.asset_code, p.asset_issuer)),
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(keypair);
  return server.submitTransaction(tx);
}
```

---

## Minimal Swap UI Sample

```jsx
import { useState } from 'react';

export function SwapWidget({ keypair }) {
  const [sendAmount, setSendAmount] = useState('');
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');

  async function handlePreview() {
    const paths = await findSwapPaths(USDC, XLM, sendAmount);
    setPreview(paths[0]);
  }

  async function handleSwap() {
    if (!preview) return;
    setStatus('Submitting…');
    try {
      await executeSwap(keypair, USDC, sendAmount, XLM, preview);
      setStatus('Swap complete!');
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <div>
      <input
        type="number"
        placeholder="USDC amount"
        value={sendAmount}
        onChange={(e) => setSendAmount(e.target.value)}
      />
      <button onClick={handlePreview}>Preview</button>
      {preview && (
        <p>
          You will receive ≥{' '}
          {(parseFloat(preview.destination_amount) * 0.99).toFixed(7)} XLM
        </p>
      )}
      <button onClick={handleSwap} disabled={!preview}>
        Swap
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}
```

---

## Notes

- Always re-run pathfinding immediately before submission — paths and rates change as orders fill.
- Set `destMin` conservatively (1–2% slippage) to protect users from price movement between preview and execution.
- Use `PathPaymentStrictReceive` instead if your UI fixes the output amount (e.g. "receive exactly 50 XLM").

**Related:** [Horizon Integration](/docs/integrations/horizon), [Glossary: Path Payment and Offer](/routes-d/460-glossary-path-payment-offer)
