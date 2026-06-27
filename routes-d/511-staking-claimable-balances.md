---
title: Staking with Claimable Balances
description: Guide on trust models, creation, and claim flows for staking patterns using Stellar Claimable Balances.
---

# Staking with Claimable Balances

Claimable Balances on Stellar allow you to lock up funds (staking) that can only be claimed at a later date or under specific conditions. This pattern is commonly used for secure, non-custodial or semi-custodial staking mechanisms.

---

## Trust Model

Unlike traditional smart contracts, Stellar Claimable Balances are first-class ledger entries.
- **Security**: The funds are locked on-chain in a claimable balance entry. No single party can run away with the funds unless the claim preconditions are met.
- **Preconditions**: You can restrict claims based on time limits (relative or absolute timestamps) or signature constraints.

---

## Creation and Claim Flows

Staking via claimable balances typically follows this flow:

1. **Locking (Staking)**: The user creates a `CreateClaimableBalance` operation. They define the amount and the claimants (e.g., the user or the staking validator) along with time-based lock-up conditions (e.g., `beforeAbsoluteTime` or `afterAbsoluteTime`).
2. **Waiting**: The funds remain locked on the ledger.
3. **Unlocking (Claiming)**: Once the lock-up duration expires, the claimant submits a `ClaimClaimableBalance` operation specifying the Balance ID to unlock the funds.

---

## Small Example

Below is a Javascript example showing how to create a time-locked claimable balance (staking) and how to claim it once the duration has passed.

### 1. Creating a Locked Staking Balance
```javascript
import { TransactionBuilder, Operation, Claimant, Networks, Asset } from '@stellar/stellar-sdk';

// Lock funds so they can only be claimed by the staker after a certain time
const claimant = Claimant.afterAbsoluteTime('1780000000'); // Unix timestamp

const tx = new TransactionBuilder(stakerAccount, { fee: 100 })
  .addOperation(
    Operation.createClaimableBalance({
      asset: Asset.native(),
      amount: '500.0000000',
      claimants: [
        new Claimant(stakerAccount.accountId(), claimant)
      ]
    })
  )
  .setTimeout(30)
  .build();
```

### 2. Claiming the Staked Balance
```javascript
const claimTx = new TransactionBuilder(stakerAccount, { fee: 100 })
  .addOperation(
    Operation.claimClaimableBalance({
      balanceId: '00000000a1b2c3d4...' // The Balance ID of the staked funds
    })
  )
  .setTimeout(30)
  .build();
```
