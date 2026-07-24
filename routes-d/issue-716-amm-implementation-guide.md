---
title: AMM Implementation on Soroban
description: A comprehensive guide to implementing an automated market maker on Soroban, comparing pricing formulas, covering fee and slippage handling, and providing a reference contract design
---

# AMM Implementation on Soroban

An automated market maker (AMM) lets users trade assets against a liquidity pool instead of a counterparty. This guide compares the pricing formulas you can build on, explains how fees and slippage should be handled, and walks through a reference design for a Soroban AMM contract.

---

## Table of Contents

1. [How an AMM Works](#how-an-amm-works)
2. [Comparing Pricing Formulas](#comparing-pricing-formulas)
3. [Fee Handling](#fee-handling)
4. [Slippage Handling](#slippage-handling)
5. [Reference Design](#reference-design)
6. [Testing the Pool](#testing-the-pool)
7. [Production Considerations](#production-considerations)

---

## How an AMM Works

A pool holds reserves of two assets, `A` and `B`. Traders swap one for the other; the pool's pricing formula decides how much of `B` a trader receives for a given amount of `A`. Liquidity providers (LPs) deposit both assets and receive pool shares that entitle them to a proportional cut of reserves plus accumulated fees.

```
        deposit A + B                    swap A -> B
LP  ------------------->  Pool  <-------------------  Trader
    <-------------------  (reserves,     ------------->
        pool shares        formula,        B out, fee
                           fees)           retained
```

Stellar's classic protocol already ships constant-product liquidity pools natively (CAP-38). Building your own AMM on Soroban makes sense when you need a different curve, custom fee logic, LP incentives, or composability with other contracts.

---

## Comparing Pricing Formulas

### Constant product (`x * y = k`)

The Uniswap V2 formula. For reserves `x` and `y`, any swap must keep the product constant:

```
(x + dx) * (y - dy) = x * y
dy = y * dx / (x + dx)
```

- **Pros:** simple, never runs out of inventory, price always defined, easy to audit.
- **Cons:** high slippage for large trades relative to reserves; LPs suffer impermanent loss when prices trend.
- **Use when:** volatile pairs, general-purpose pools, first implementation.

### Constant sum (`x + y = k`)

Trades 1:1 until one side is exhausted.

- **Pros:** zero slippage while both reserves last.
- **Cons:** the pool can be fully drained of one asset the moment the market price deviates from 1:1 — an arbitrageur will take the entire cheaper side.
- **Use when:** effectively never on its own; useful only as a component of hybrid curves.

### StableSwap / hybrid (Curve-style)

Interpolates between constant sum (near balance) and constant product (when unbalanced), controlled by an amplification coefficient `A`:

```
A * n^n * sum(x_i) + D = A * D * n^n + D^(n+1) / (n^n * prod(x_i))
```

- **Pros:** very low slippage for like-valued assets (e.g. USDC/EURC-pegged pairs, wrapped variants).
- **Cons:** iterative solvers (Newton's method) on-chain cost more compute; mispriced `A` hurts LPs when a peg breaks.
- **Use when:** stablecoin pairs or assets that track each other tightly.

### Concentrated liquidity (Uniswap V3-style)

LPs allocate liquidity to price ranges, multiplying capital efficiency.

- **Pros:** far better quotes with the same TVL.
- **Cons:** substantially more complex (tick math, per-position accounting, NFT-like positions); LP experience is active, not passive.
- **Use when:** you have deep liquidity demands and experienced LPs; not recommended as a first Soroban AMM.

### Summary

| Formula           | Slippage profile    | Complexity | Best fit                       |
| ----------------- | ------------------- | ---------- | ------------------------------ |
| Constant product  | Moderate everywhere | Low        | Volatile pairs, default choice |
| Constant sum      | None until drained  | Low        | Never standalone               |
| StableSwap hybrid | Very low near peg   | Medium     | Pegged/correlated pairs        |
| Concentrated      | Low inside ranges   | High       | Mature, deep markets           |

The reference design below uses **constant product** — it is the simplest formula that is safe to ship, and everything else in the contract (fees, shares, slippage guards) carries over unchanged if you later swap the curve.

---

## Fee Handling

Fees compensate LPs for impermanent loss and make arbitrage-driven rebalancing profitable for the pool.

- **Charge on input, inside the invariant.** Deduct the fee from the input amount before applying the curve, so fees accrue into reserves and compound for LPs:

```
dx_after_fee = dx * (FEE_DENOM - fee_bps) / FEE_DENOM
dy = y * dx_after_fee / (x + dx_after_fee)
```

- **Basis points, integer math only.** Store `fee_bps` (e.g. `30` = 0.30%) and a `FEE_DENOM` of `10_000`. Soroban contracts use `i128` arithmetic — never floats.
- **Rounding must favor the pool.** Round `dy` down and any fee up. If rounding ever favors the trader, the pool leaks value one stroop at a time under adversarial trade sizing.
- **Protocol fee (optional).** A cut of the LP fee (e.g. 1/6) can be diverted to a treasury address. Keep it a parameter with a hard upper bound so governance cannot rug LPs.

---

## Slippage Handling

Slippage is the difference between the quoted price and the executed price. Two mechanisms protect traders:

1. **`min_out` on swaps.** The trader supplies the minimum acceptable output; the contract aborts if the curve produces less. This is the primary defense against sandwich attacks and stale quotes.
2. **Deadline / ledger bound.** Reject transactions that execute after a caller-supplied ledger sequence, so a quote signed at ledger `N` cannot execute at `N + 500` when reserves have moved.

For LP operations, the same idea applies: `deposit` takes `min_shares`, `withdraw` takes `min_a` / `min_b`.

> Quoting UIs should compute expected output off-chain from current reserves, then set `min_out = expected * (1 - tolerance)` with a user-configurable tolerance (0.1%–1% is typical).

---

## Reference Design

The contract below is a minimal but complete constant-product pool. Interface first:

```rust
pub trait LiquidityPool {
    /// One-time setup with the two token addresses and the LP fee.
    fn initialize(env: Env, token_a: Address, token_b: Address, fee_bps: u32);

    /// Deposit both assets; mints pool shares. Aborts if shares < min_shares.
    fn deposit(env: Env, from: Address, amount_a: i128, amount_b: i128, min_shares: i128) -> i128;

    /// Swap an exact amount of one asset for the other.
    fn swap(env: Env, from: Address, buy_a: bool, amount_in: i128, min_out: i128, deadline_ledger: u32) -> i128;

    /// Burn shares, receive proportional reserves.
    fn withdraw(env: Env, from: Address, shares: i128, min_a: i128, min_b: i128) -> (i128, i128);

    /// Read-only quote for UIs.
    fn quote(env: Env, buy_a: bool, amount_in: i128) -> i128;
}
```

Core swap logic:

```rust
const FEE_DENOM: i128 = 10_000;

fn swap_out(reserve_in: i128, reserve_out: i128, amount_in: i128, fee_bps: u32) -> i128 {
    // Fee is taken from the input and stays in the pool for LPs.
    let in_after_fee = amount_in
        .checked_mul(FEE_DENOM - fee_bps as i128)
        .unwrap()
        / FEE_DENOM;

    // dy = y * dx' / (x + dx'), rounded down (favors the pool).
    reserve_out
        .checked_mul(in_after_fee)
        .unwrap()
        / reserve_in.checked_add(in_after_fee).unwrap()
}

pub fn swap(env: Env, from: Address, buy_a: bool, amount_in: i128, min_out: i128, deadline_ledger: u32) -> i128 {
    from.require_auth();

    if env.ledger().sequence() > deadline_ledger {
        panic_with_error!(&env, Error::DeadlineExpired);
    }
    if amount_in <= 0 {
        panic_with_error!(&env, Error::InvalidAmount);
    }

    let (mut reserve_a, mut reserve_b) = read_reserves(&env);
    let (reserve_in, reserve_out) = if buy_a { (reserve_b, reserve_a) } else { (reserve_a, reserve_b) };

    let out = swap_out(reserve_in, reserve_out, amount_in, read_fee_bps(&env));
    if out < min_out {
        panic_with_error!(&env, Error::SlippageExceeded);
    }

    // Pull the input, push the output.
    let (token_in, token_out) = swap_token_addresses(&env, buy_a);
    token::Client::new(&env, &token_in).transfer(&from, &env.current_contract_address(), &amount_in);
    token::Client::new(&env, &token_out).transfer(&env.current_contract_address(), &from, &out);

    if buy_a { reserve_a -= out; reserve_b += amount_in; } else { reserve_a += amount_in; reserve_b -= out; }
    write_reserves(&env, reserve_a, reserve_b);

    env.events().publish((symbol_short!("swap"), from), (buy_a, amount_in, out));
    out
}
```

Share accounting for deposits uses the standard geometric-mean bootstrap and proportional mints afterwards:

```rust
fn shares_for_deposit(total_shares: i128, reserve_a: i128, reserve_b: i128, amount_a: i128, amount_b: i128) -> i128 {
    if total_shares == 0 {
        // First LP: sqrt(a * b) locks the initial price; burn a minimum
        // liquidity amount to prevent share-price inflation attacks.
        integer_sqrt(amount_a.checked_mul(amount_b).unwrap()) - MINIMUM_LIQUIDITY
    } else {
        // Subsequent LPs: mint the smaller proportional amount so deposits
        // at the wrong ratio donate the excess to the pool.
        core::cmp::min(
            amount_a.checked_mul(total_shares).unwrap() / reserve_a,
            amount_b.checked_mul(total_shares).unwrap() / reserve_b,
        )
    }
}
```

Design notes:

- **Reserves are tracked in storage, not read from token balances.** Balance-based accounting is manipulable by direct transfers into the contract.
- **`MINIMUM_LIQUIDITY` (e.g. 1,000 share units) is burned on first deposit.** Without it, the first LP can inflate share price and round out later depositors.
- **All state-changing entry points call `require_auth()`** on the acting address, and token movements use the token client so Stellar Asset Contract (SAC) wrapped assets and custom tokens both work.
- **Events on every mutation** (`deposit`, `swap`, `withdraw`) so indexers and UIs can track the pool without polling.

---

## Testing the Pool

Test the math exhaustively before anything else — curve bugs are the expensive ones:

```rust
#[test]
fn swap_preserves_invariant() {
    // k must never decrease across a swap (fees make it grow).
    let out = swap_out(1_000_000, 1_000_000, 10_000, 30);
    let k_before = 1_000_000i128 * 1_000_000;
    let k_after = (1_000_000 + 10_000) * (1_000_000 - out);
    assert!(k_after >= k_before);
}

#[test]
fn swap_rounds_in_favor_of_pool() {
    // Tiny swaps must never extract more than they put in.
    assert_eq!(swap_out(1_000_000_000, 1_000_000_000, 1, 30), 0);
}
```

Then integration-test with the Soroban test environment: deposit → swap both directions → withdraw, asserting reserve and share conservation at each step, plus the failure paths (`SlippageExceeded`, `DeadlineExpired`, zero amounts, uninitialized pool).

---

## Production Considerations

- **Oracle usage:** spot reserves are manipulable within a transaction; never let another protocol read them as a price feed. Expose a TWAP accumulator if downstream contracts need prices.
- **Upgradability:** if you use contract upgrade hooks, gate them behind a timelocked admin and emit events, so LPs can exit before logic changes.
- **Fee bounds:** enforce `fee_bps <= 100` (1%) or similar at `initialize` — a governance mistake should not be able to set a 100% fee.
- **Decimal mismatches:** pools of tokens with different decimals work fine with constant product, but UIs must normalize when displaying prices.
- **Audit the rounding direction of every division** — it is the single most common AMM bug class.

With the constant-product base in place, a StableSwap curve or protocol-fee switch can be added behind the same interface without changing the LP or trader experience.
