---
title: Mainnet Launch Preflight Checklist
description: A thorough pre-flight checklist for launching a Stellar application or asset on mainnet, covering keys, reserves, infrastructure, monitoring, and rollback options
---

# Mainnet Launch Preflight Checklist

This checklist covers the critical steps before going live on Stellar mainnet. Work through every section in order; do not skip items because "it worked on testnet." Testnet and mainnet differ in fee pressure, validator behavior, and irreversibility.

---

## 1. Keys and Signers

- [ ] **Master key generated offline.** The issuer and treasury master keys were generated on an air-gapped machine, never on a network-connected device.
- [ ] **Hardware wallet confirmed.** At least one signing key is stored on a hardware wallet (Ledger, Trezor, or equivalent). Test a transaction signature end-to-end before launch.
- [ ] **Multi-sig threshold configured.** If the account requires M-of-N signing, verify the `thresholds` and `signers` fields are set correctly:
  ```js
  // Verify multi-sig setup before launch
  const account = await server.loadAccount(issuerPublicKey);
  console.log("Thresholds:", account.thresholds);
  console.log("Signers:", account.signers);
  ```
- [ ] **Test signing rehearsal complete.** Build and submit a zero-value test transaction signed by the full multi-sig quorum. Confirm it succeeds on testnet and that you understand the UX for each signer.
- [ ] **Emergency key rotation plan documented.** You have a written procedure for revoking and replacing a compromised signer key, including who has authority to trigger it.
- [ ] **Secret keys are not in version control.** Run `git log --all --full-history -- '*.env' '*.json'` and verify no keys appear in git history.

---

## 2. Account Reserves

Stellar accounts require a minimum XLM balance to exist and to hold entries. The formula is:

```
minimum balance = (2 + number_of_subentries) × base_reserve
```

Current base reserve is **0.5 XLM** (subject to validator vote). Each trustline, offer, data entry, and signer adds one subentry (0.5 XLM).

- [ ] **All accounts pre-loaded with reserves.** Calculate the expected number of subentries for each account and fund accordingly, with a buffer:
  ```js
  // Calculate reserve for an account with N subentries
  function minimumBalance(subentries, baseReserve = 0.5) {
    return (2 + subentries) * baseReserve;
  }

  // Example: issuer with 10 data entries, distributor with 1 trustline
  console.log("Issuer reserve:", minimumBalance(10)); // 6 XLM
  console.log("Distributor reserve:", minimumBalance(1)); // 1.5 XLM
  ```
- [ ] **Reserve buffer added.** Fund each account with at least 2× the minimum reserve to tolerate future subentry additions without emergencies.
- [ ] **Fee reserves accounted for.** Estimate daily transaction volume and reserve sufficient XLM for fees. At 100 stroops per operation, 10,000 ops/day costs 1 XLM/day.

---

## 3. Infrastructure

- [ ] **Horizon endpoint selected.** Decide between the SDF public endpoint (`https://horizon.stellar.org`), a self-hosted Horizon node, or a third-party provider (QuickNode, Ankr). Document rate limits for your choice.
- [ ] **Redundancy in place.** Configure at least two Horizon endpoints. Your client falls over to the backup if the primary returns errors for more than N seconds.
- [ ] **Soroban RPC endpoint configured** (if using smart contracts). Verify `getLatestLedger` returns a recent sequence on mainnet:
  ```js
  const server = new SorobanRpc.Server("https://soroban-rpc.stellar.org");
  const ledger = await server.getLatestLedger();
  console.log("Latest mainnet ledger:", ledger.sequence);
  ```
- [ ] **Connection pool / retry logic implemented.** All Horizon and RPC calls have exponential backoff and a maximum retry count. Transient 429 and 503 responses do not crash the application.
- [ ] **TLS and authentication.** If self-hosting, TLS certificates are valid and auto-renewing. API keys or IP allowlists are configured where applicable.

---

## 4. Network Fee Strategy

- [ ] **Fee percentile monitoring enabled.** Fetch `https://horizon.stellar.org/fee_stats` to understand current network fee pressure before launch and during operations:
  ```js
  const feeStats = await server.feeStats();
  console.log("P90 fee:", feeStats.fee_charged.p90);
  ```
- [ ] **Dynamic fee logic implemented.** Your transaction builder reads the P90 or P99 fee and sets the transaction fee accordingly, rather than using a hard-coded `BASE_FEE`.
- [ ] **Fee bump transactions implemented** for critical paths. If a time-sensitive transaction risks being dropped due to surge pricing, you can re-submit it with a fee bump without changing the inner transaction:
  ```js
  import { TransactionBuilder } from "@stellar/stellar-sdk";

  const feeBump = TransactionBuilder.buildFeeBumpTransaction(
    feeSourceKeypair,
    maxFeePerOperation,
    innerTransaction,
    Networks.PUBLIC
  );
  feeBump.sign(feeSourceKeypair);
  await server.submitTransaction(feeBump);
  ```
- [ ] **Fee account funded separately.** The account paying fees on behalf of users has a dedicated XLM balance distinct from the reserve and operational accounts.

---

## 5. Monitoring

- [ ] **Ledger close time monitored.** Alert if the ledger sequence stops advancing for more than 30 seconds. Normal close time is approximately 5 seconds.
  ```js
  async function checkLedgerAdvancing(server, stallThresholdMs = 30_000) {
    let lastSeq = (await server.ledgers().order("desc").limit(1).call()).records[0].sequence;
    setInterval(async () => {
      const seq = (await server.ledgers().order("desc").limit(1).call()).records[0].sequence;
      if (seq === lastSeq) console.error("Ledger stalled!");
      lastSeq = seq;
    }, stallThresholdMs);
  }
  ```
- [ ] **Transaction success rate tracked.** Log the ratio of `successful` to `failed` transactions over a rolling window. A sudden drop indicates a configuration or network issue.
- [ ] **Account balances monitored.** Continuously check XLM balances for all operational accounts (fee account, distributor, issuer). Alert before any account drops below 2× the minimum reserve.
- [ ] **Fee level monitoring active.** Alert when the P90 fee exceeds a threshold that would break your dynamic fee logic or exhaust the fee account faster than expected.

---

## 6. Alerting

- [ ] **Alert thresholds defined:**
  - XLM balance < 2× minimum reserve → page on-call
  - Transaction failure rate > 5% over 5 minutes → alert
  - Ledger close gap > 30 seconds → alert
  - P90 fee > 10× `BASE_FEE` → warning
- [ ] **Escalation path documented.** On-call rotation, secondary contact, and escalation to the Stellar Discord `#dev-discussion` channel are all documented and tested.
- [ ] **Alert channels tested.** Send a test alert through every configured channel (PagerDuty, Slack, email) before go-live. Silence during an incident is worse than a false positive.

---

## 7. Pre-Launch Validation

- [ ] **Testnet dry run complete.** The full user journey — from account creation through all critical transactions — was run on testnet with the same code and configuration that will hit mainnet.
- [ ] **Smart contract audit complete** (if applicable). Any Soroban contracts deployed to mainnet have been reviewed by an independent security auditor. Audit report is available to stakeholders.
- [ ] **Integration tests pass.** Automated tests exercise every external API call and transaction type against testnet with realistic data volumes.
- [ ] **Load test performed.** If expecting high concurrency at launch, a load test was run against testnet at the anticipated peak request rate. Results are within acceptable bounds.
- [ ] **Internal links and navigation verified.** All documentation links, UI deep-links, and API endpoint references resolve correctly against mainnet URLs.

---

## 8. Rollback Options

- [ ] **Asset freeze procedure documented.** If you need to halt all transfers of a regulated asset, the step-by-step procedure to set `AUTHORIZATION_REVOCABLE` and freeze all trustlines is written down and tested.
- [ ] **Emergency contact list ready.** You have direct contacts at your Horizon provider and know how to reach the Stellar Development Foundation support channel for network-level issues.
- [ ] **Incident runbook written.** The runbook covers at minimum: who declares an incident, how to page on-call, how to pause inbound transactions, how to pause outbound transactions, and what constitutes an all-clear.
- [ ] **Read-only mode implemented** (if applicable). Your application can be switched to a read-only state that prevents new transactions without a full deployment.
- [ ] **Data backups current.** All off-chain databases (event indexes, account state caches) have a recent backup, and the restore procedure has been tested.

---

## 9. Go-Live Sequence

Execute in this order:

1. **Deploy infrastructure.** Horizon nodes, Soroban RPC nodes, and supporting services are live and healthy.
2. **Deploy contracts to mainnet** (if applicable). Verify the contract ID on the mainnet ledger explorer.
3. **Fund all operational accounts.** Confirm XLM balances cover reserves and fee budgets.
4. **Set issuer account flags.** Verify on-chain with a Horizon account lookup.
5. **Authorize distribution account.** Confirm trustline authorization before minting.
6. **Run smoke tests against mainnet.** Send a minimal test transaction end-to-end. Confirm it appears in Horizon within two ledger closes.
7. **Enable monitoring and alerting.** Verify alerts are firing for the smoke test account balance changes.
8. **Open public access.** Remove any IP restrictions or feature flags gating the application.
9. **Monitor for 24 hours.** Keep on-call engineering available. Review all alert channels every hour for the first day.
10. **Post-launch review.** At 24h, hold a brief review of transaction volumes, fee spend, and any incidents. Adjust thresholds as needed.

---

## Notes

- The Stellar base reserve has changed historically via validator vote. Monitor the `base_reserve_in_stroops` field from `https://horizon.stellar.org/` so your reserve calculations stay current.
- Fee surge pricing can spike transaction costs 10–100× during high-volume network events. Ensure your fee account has headroom for this scenario.
- Keep testnet infrastructure running after mainnet launch. It is cheaper to debug issues on testnet than to reproduce them on mainnet.

**Related:** [Horizon Integration](/docs/integrations/horizon), [Asset Compliance Flags](/routes-d/504-asset-compliance-flags), [Transaction Observability](/routes-d/transaction-observability)
