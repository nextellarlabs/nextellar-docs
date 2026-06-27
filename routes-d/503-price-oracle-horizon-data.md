---
title: Price Oracle Integration with Horizon Data
description: How to derive price signals from Horizon market data, staleness considerations, and a small mid-price example
---

# Price Oracle Integration with Horizon Data

On-chain Soroban contracts cannot fetch HTTP endpoints directly, but off-chain services can read Stellar's decentralized exchange (DEX) data through Horizon and push derived prices to a contract or cache. Horizon exposes order books, recent trades, and path-finding endpoints that together form a practical price signal for many asset pairs.

---

## Data Sources

| Horizon endpoint            | What it provides                         | Typical use                                  |
| --------------------------- | ---------------------------------------- | -------------------------------------------- |
| `GET /order_book`           | Current bids and asks for a trading pair | Mid-price, spread, liquidity depth           |
| `GET /trades`               | Executed trades (recent history)         | Volume-weighted average price (VWAP)         |
| `GET /paths/strict-receive` | Best conversion path for a target amount | Effective swap price including path payments |
| `GET /assets`               | Issuer metadata, tom flags               | Filter unauthorized or frozen assets         |

All endpoints are available through the Stellar SDK:

```js
import { Horizon, Asset } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon.stellar.org');
const usdc = new Asset(
  'USDC',
  'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPPXUUZAAZ5'
);

// Order book snapshot
const book = await server.orderbook(usdc, Asset.native()).call();

// Recent trades (newest first with order=desc)
const trades = await server
  .trades()
  .forAssetPair(usdc, Asset.native())
  .order('desc')
  .limit(20)
  .call();
```

---

## Deriving a Mid-Price

The simplest signal is the midpoint between the best bid and best ask:

```js
function midPriceFromOrderBook(book) {
  const bestBid = book.bids[0];
  const bestAsk = book.asks[0];

  if (!bestBid || !bestAsk) return null;

  const bid = parseFloat(bestBid.price);
  const ask = parseFloat(bestAsk.price);

  return (bid + ask) / 2;
}

async function fetchXlmUsdcMid(server) {
  const usdc = new Asset(
    'USDC',
    'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPPXUUZAAZ5'
  );
  const book = await server.orderbook(usdc, Asset.native()).call();
  return midPriceFromOrderBook(book);
}
```

For thin markets, prefer a **VWAP over recent trades** instead of the mid-price:

```js
function vwapFromTrades(trades) {
  let volume = 0;
  let notional = 0;

  for (const trade of trades.records) {
    const qty = parseFloat(trade.base_amount);
    const px = parseFloat(trade.price);
    volume += qty;
    notional += qty * px;
  }

  return volume > 0 ? notional / volume : null;
}
```

---

## Staleness Considerations

| Risk                        | Mitigation                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------ |
| **Order book snapshot age** | Timestamp is implicit — re-fetch on a fixed interval (e.g. every ledger close, ~5 s) |
| **Stale resting offers**    | Cross-check against recent trades; ignore bids/asks with zero recent volume          |
| **Wide spread**             | Treat mid-price as unreliable when `(ask - bid) / mid > threshold` (e.g. 2%)         |
| **Thin liquidity**          | Require minimum depth at top of book before publishing a price                       |
| **Ledger delay**            | Horizon trails the network by roughly one ledger; not suitable for sub-second HFT    |
| **Push oracle lag**         | Record `lastUpdated` in your contract and reject reads older than `maxAgeSeconds`    |

A practical policy: publish a price only when the spread is below your threshold **and** at least one trade occurred in the last N ledgers.

```js
const MAX_SPREAD_PCT = 0.02;
const MAX_TRADE_AGE_SEC = 60;

function isPriceFresh(book, latestTrade) {
  const mid = midPriceFromOrderBook(book);
  if (!mid || !latestTrade) return false;

  const bid = parseFloat(book.bids[0].price);
  const ask = parseFloat(book.asks[0].price);
  const spread = (ask - bid) / mid;

  const tradeAge =
    Date.now() / 1000 -
    new Date(latestTrade.ledger_close_time).getTime() / 1000;

  return spread <= MAX_SPREAD_PCT && tradeAge <= MAX_TRADE_AGE_SEC;
}
```

---

## Small Example: Off-Chain Feeder

```js
import { Horizon, Asset } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon.stellar.org');
const USDC = new Asset(
  'USDC',
  'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPPXUUZAAZ5'
);

async function pollAndPush(onPrice) {
  const [book, trades] = await Promise.all([
    server.orderbook(USDC, Asset.native()).call(),
    server
      .trades()
      .forAssetPair(USDC, Asset.native())
      .order('desc')
      .limit(10)
      .call(),
  ]);

  const latestTrade = trades.records[0];
  if (!isPriceFresh(book, latestTrade)) {
    console.warn('Price signal stale or spread too wide — skipping publish');
    return;
  }

  const price = midPriceFromOrderBook(book);
  await onPrice({
    pair: 'XLM/USDC',
    price,
    ledger: latestTrade.ledger,
    updatedAt: new Date().toISOString(),
  });
}

// Poll every ledger close (~5 s)
setInterval(() => pollAndPush(pushToOracleContract), 5_000);
```

Wire `pushToOracleContract` to your Soroban admin keypair — see [Soroban Oracle Integration](/routes-d/449-soroban-oracle-integration) for the on-chain consumer side.

---

## Notes

- Stellar stores offer prices as exact fractions (`price_r.n` / `price_r.d`); Horizon also returns a decimal `price` string — use `price_r` when precision matters. See [Price Representation](/routes-d/502-price-representation).
- For pairs with no direct market, use `/paths/strict-receive` to derive an implied price through intermediary assets.
- Do not treat Horizon DEX data as an authoritative fiat oracle — it reflects on-network liquidity, not external exchange rates.

**Related:** [Price Representation and Precision](/routes-d/502-price-representation), [Soroban Oracle Integration](/routes-d/449-soroban-oracle-integration), [Horizon Integration](/docs/integrations/horizon)
