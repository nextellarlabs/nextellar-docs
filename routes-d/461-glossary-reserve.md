---
title: 'Glossary: Reserve'
description: Short definition of the Stellar reserve requirement and its impact on minimum account balance
---

# Glossary: Reserve

A fixed amount of XLM that every Stellar account must hold for each ledger entry it owns. Reserves keep the ledger size manageable by attaching a cost to each piece of state an account maintains.

---

## How It Works

The network defines two values:

| Value             | Description                                 |
| ----------------- | ------------------------------------------- |
| `base_reserve`    | Currently 0.5 XLM                           |
| `minimum balance` | `(2 + number of subentries) × base_reserve` |

Every account starts with 2 base reserves (1 XLM) simply for existing. Each additional subentry — trustline, offer, signer, data entry, claimable balance sponsorship — adds one more base reserve requirement.

**Example:** an account with 3 trustlines and 1 data entry has 6 subentries, so its minimum balance is `(2 + 6) × 0.5 XLM = 4 XLM`.

---

## Impact on Minimum Balance

Attempting to make a payment that would drop the account's XLM balance below its minimum fails with `op_underfunded`. Always account for reserves when calculating how much XLM a user can send.

```js
// Rough reserve check before sending XLM
const account = await server.loadAccount(publicKey);
const subentries = account.subentry_count;
const minBalance = (2 + subentries) * 0.5;
const available =
  parseFloat(account.balances.find((b) => b.asset_type === 'native').balance) -
  minBalance;
```

---

## Notes

- Reserves are not fees; the XLM is not burned or transferred — it simply cannot be spent while the subentry exists.
- Removing a trustline (with zero balance) or cancelling an offer releases the reserve back to spendable balance.

**Related:** base reserve, subentry, trustline, minimum balance, `op_underfunded`

**Related docs:** [Horizon Integration](/docs/integrations/horizon), [Glossary](/docs/guides/glossary)
