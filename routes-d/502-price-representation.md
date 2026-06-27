---
title: Price Representation and Precision
description: How Stellar represents prices as fractions, precision limits, and rounding behaviors
---

# Price Representation and Precision

Stellar stores prices as exact integer fractions rather than floating-point decimals. This avoids rounding drift and ensures every node reaches the same value when applying ledger changes.

---

## Fraction Representation

A price on Stellar is stored as `{ n: numerator, d: denominator }` where both values are 32-bit integers. The effective price is `n / d`.

```json
{
  "price_r": { "n": 1, "d": 10 },
  "price": "0.1000000"
}
```

Horizon also returns `price` as a human-readable decimal string for convenience, but the canonical value is always `price_r`.

---

## Precision Limits

- Both `n` and `d` are signed 32-bit integers, so they cap at **2,147,483,647**.
- The maximum representable price is roughly `2.1 billion / 1 ≈ 2.1 × 10⁹`.
- The minimum non-zero price is `1 / 2,147,483,647 ≈ 4.7 × 10⁻¹⁰`.

To represent `0.0001234567` exactly you need `n` and `d` to share no common factor and both stay within the 32-bit limit:

```js
// Simple fraction reduction (GCD)
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function toFraction(decimal, maxDenominator = 10_000_000) {
  const d = Math.min(maxDenominator, Math.round(1 / (decimal % 1 || decimal)));
  const n = Math.round(decimal * d);
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}
```

---

## Rounding Behaviors

| Context         | Behavior                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Offer price     | Rounded to fit within 32-bit numerator/denominator; slight price shift is possible               |
| Path payment    | Rounded in favor of the network — you may receive slightly less than the exact calculated amount |
| `amount` fields | Always 7 decimal places (stroops); truncated, not rounded                                        |

A practical consequence: if you calculate `0.1 / 3 ≈ 0.03333…`, Stellar will store `1/30` (or the nearest representable fraction), not `0.0333333`.

---

## Example

```js
import { Operation, Asset } from '@stellar/stellar-sdk';

// Sell 100 USDC for XLM at price 0.1 XLM per USDC (n=1, d=10)
const offer = Operation.manageSellOffer({
  selling: usdcAsset,
  buying: Asset.native(),
  amount: '100',
  price: { n: 1, d: 10 },
});
```

**Related:** [Horizon Integration](/docs/integrations/horizon), [Glossary](/docs/guides/glossary)
