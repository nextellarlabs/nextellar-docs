---
title: Time-Weighted Average Pricing on Stellar
description: A comprehensive guide to building a TWAP oracle pattern on Stellar, covering data collection strategies, a small on-chain aggregator, and staleness handling
---

# Time-Weighted Average Pricing on Stellar

A spot price is one observation; a time-weighted average price (TWAP) is the average of observations weighted by how long each one was in effect. Protocols use TWAPs instead of spot prices because a spot price can be pushed around within a single ledger — a TWAP over a sensible window cannot be moved far without sustaining the manipulation (and paying arbitrageurs) for the whole window. This guide covers where the price data comes from, a small Soroban aggregator that maintains the average, and the staleness handling that keeps consumers safe.

---

## Table of Contents

1. [What a TWAP Buys You](#what-a-twap-buys-you)
2. [Data Collection Strategies](#data-collection-strategies)
3. [The Accumulator Technique](#the-accumulator-technique)
4. [A Small Aggregator Contract](#a-small-aggregator-contract)
5. [Staleness Handling](#staleness-handling)
6. [Choosing a Window](#choosing-a-window)
7. [Operational Notes](#operational-notes)

---

## What a TWAP Buys You

For observations `p_i` each in effect for duration `t_i` over window `T = Σ t_i`:

```
TWAP = Σ (p_i * t_i) / T
```

To move a 30-minute TWAP by 10%, an attacker must hold the manipulated spot price for a meaningful fraction of 30 minutes, eating arbitrage losses the entire time — versus a spot read, which can be manipulated and restored inside one transaction. The cost of the attack scales with the window length, which is exactly the knob you control.

The trade-off: a TWAP lags the real price by design. Liquidation engines and mint/redeem logic want manipulation resistance; trading UIs want freshness. Serve both by exposing spot and TWAP separately.

---

## Data Collection Strategies

Three ways to get observations, in increasing order of infrastructure:

### 1. Poll-and-push (cron keeper)

An off-chain keeper reads prices on a schedule (from Stellar DEX orderbooks/liquidity pools, or external markets) and pushes them into the aggregator contract.

- **Pros:** simplest to build; sources can be anything (on-ledger and off).
- **Cons:** you now trust the keeper's key(s); missed cron runs create gaps.
- **Mitigations:** multiple submitter keys with per-key rate limits, sanity bounds on-chain (reject a push that moves price > X% from the previous observation unless confirmed by a second key).

### 2. Event-driven sampling

A daemon subscribes to trades/pool events (Horizon streaming or Soroban RPC events) and pushes an observation whenever meaningful volume moves the price, with a minimum interval floor.

- **Pros:** observations concentrate where price actually changes; efficient in quiet markets.
- **Cons:** more moving parts; needs the same trust mitigations as polling; bursty markets need debouncing.

### 3. On-chain accumulator at the source (AMM-embedded)

If the price comes from your own Soroban AMM, update a cumulative-price accumulator inside the swap function itself. No keeper exists; every trade updates the oracle as a side effect.

- **Pros:** trustless — data collection cannot be skipped or censored separately from trading itself.
- **Cons:** only prices assets your AMM trades; adds a small cost to every swap.

> Rule of thumb: if you control the AMM, embed the accumulator (strategy 3) and let anyone read it. If prices must come from external markets, run poll-and-push (strategy 1) with multiple keys and on-chain sanity bounds, and upgrade to event-driven sampling when observation quality matters.

---

## The Accumulator Technique

Storing every observation and averaging on read is O(n) storage and compute. The standard trick stores a single running sum instead: the **cumulative price**, updated whenever the price changes:

```
cumulative += last_price * (now - last_timestamp)
```

A TWAP between any two snapshots of the accumulator is then O(1):

```
TWAP(t1, t2) = (cumulative(t2) - cumulative(t1)) / (t2 - t1)
```

Consumers (or the contract itself, via a small ring buffer of snapshots) keep checkpoints at the window edges they care about.

---

## A Small Aggregator Contract

A Soroban aggregator using the accumulator plus a ring buffer of periodic snapshots, so consumers can query a TWAP without storing checkpoints themselves:

```rust
#[derive(Clone)]
#[contracttype]
pub struct Observation {
    pub timestamp: u64,     // ledger close time of the snapshot
    pub cumulative: i128,   // Σ price * elapsed, in price units * seconds
}

const RING_SIZE: u32 = 64;          // snapshots kept
const MIN_SNAPSHOT_GAP: u64 = 60;   // seconds between ring entries

pub fn submit(env: Env, submitter: Address, price: i128) {
    submitter.require_auth();
    assert_is_allowed_submitter(&env, &submitter);
    assert_within_sanity_bounds(&env, price);   // e.g. |Δ| <= 20% per update

    let now = env.ledger().timestamp();
    let mut state = read_state(&env);

    // Advance the accumulator for the time the *old* price was in effect.
    let elapsed = (now - state.last_timestamp) as i128;
    state.cumulative += state.last_price * elapsed;
    state.last_price = price;
    state.last_timestamp = now;

    // Periodically snapshot into the ring buffer.
    if now - read_last_snapshot_time(&env) >= MIN_SNAPSHOT_GAP {
        push_ring(&env, Observation { timestamp: now, cumulative: state.cumulative });
    }

    write_state(&env, &state);
    env.events().publish((symbol_short!("price"),), (price, now));
}

/// TWAP over at least `window` seconds, ending now.
pub fn twap(env: Env, window: u64) -> i128 {
    let now = env.ledger().timestamp();
    let state = read_state(&env);

    // Bring the accumulator up to `now` (read-only view).
    let cum_now = state.cumulative + state.last_price * ((now - state.last_timestamp) as i128);

    // Oldest ring entry that is at least `window` old.
    let past = find_snapshot_at_or_before(&env, now - window)
        .unwrap_or_else(|| panic_with_error!(&env, Error::WindowNotCovered));

    let elapsed = (now - past.timestamp) as i128;
    (cum_now - past.cumulative) / elapsed
}
```

Design notes:

- **The accumulator advances with the _previous_ price** for the elapsed interval — the new price starts accruing weight only from its own submission time. Getting this backwards silently biases the average toward fresh prices.
- **`WindowNotCovered` is an error, not a best-effort answer.** If the ring buffer doesn't reach back `window` seconds (young oracle, long outage), refusing to answer is safer than returning an average over a shorter, unrequested window.
- **Sanity bounds on submissions** (`assert_within_sanity_bounds`) cap how far a single compromised key can move the average, complementing — not replacing — the time weighting.
- **Prices are fixed-point `i128`** (e.g. 7 decimals to match Stellar amounts). All math is integer; division happens last.

---

## Staleness Handling

A TWAP that quietly stops updating is more dangerous than no oracle: it keeps answering with confident, increasingly wrong numbers. Staleness must be handled on **both** sides.

**In the oracle — expose freshness, don't hide it:**

```rust
pub struct TwapResult {
    pub price: i128,
    pub last_update: u64,     // when data last arrived
    pub window_covered: u64,  // actual seconds the average spans
}
```

**In the consumer — enforce a freshness policy:**

```rust
let r = oracle.twap(&1800);
let age = env.ledger().timestamp() - r.last_update;

if age > MAX_AGE {                      // e.g. 5 minutes for a 30-min TWAP
    panic_with_error!(&env, Error::StalePrice);  // fail closed
}
```

Policy options when the price is stale, from safest to most permissive:

1. **Fail closed** — refuse the operation (right default for liquidations, minting, borrowing).
2. **Degrade** — allow only conservative actions (repayments, deposits) but block risk-increasing ones.
3. **Fallback** — consult a second independent oracle; require agreement within a tolerance band.

Heartbeats belong in the pipeline too: keepers should submit even when the price is unchanged (the accumulator handles this fine), so `last_update` doubles as a liveness signal, and an off-chain monitor should alert when no submission lands within the expected interval.

---

## Choosing a Window

| Window    | Manipulation cost | Lag        | Typical use                        |
| --------- | ----------------- | ---------- | ---------------------------------- |
| 1–5 min   | Low–moderate      | Small      | Display, soft limits               |
| 15–60 min | High              | Noticeable | Liquidations, collateral valuation |
| 4–24 h    | Very high         | Large      | Fee/parameter governance, indexes  |

Two windows in tandem is a common pattern: act on the short one, but only if it agrees with the long one within a band — divergence beyond the band flags either manipulation or a genuine regime change, and both deserve a pause.

---

## Operational Notes

- **Ledger close time granularity (~5s) is your floor** — windows are made of many closes, so this is rarely a problem, but don't design sub-minute TWAPs on Stellar.
- **Monitor the monitors:** alert on missed heartbeats, on sanity-bound rejections (someone pushed a wild price), and on consumer-side `StalePrice` errors.
- **Snapshot retention math:** `RING_SIZE * MIN_SNAPSHOT_GAP` bounds your maximum queryable window (64 × 60s ≈ 1 hour above). Size the ring for your longest window plus outage headroom.
- **Publish the methodology** — sources, submitters, bounds, window — so integrators can judge what your TWAP actually measures. An oracle's trust model is documentation as much as code.
