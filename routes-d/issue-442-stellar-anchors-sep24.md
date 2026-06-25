---
title: Stellar Anchors and SEP-24
description: A thorough guide to the SEP-24 interactive deposit and withdrawal flow, covering discovery, authentication, client-side handling, polling, and edge cases
---

# Stellar Anchors and SEP-24

An **Anchor** is a licensed business that bridges fiat currency and Stellar-based assets. When a user deposits USD with a US Anchor, the Anchor issues an equivalent `USDC` (or a custom stablecoin) on Stellar. Withdrawal reverses that flow. SEP-24 is the standard protocol that defines the interactive deposit and withdrawal experience.

---

## Overview of SEP-24

SEP-24 (*Stellar Ecosystem Proposal 24: Hosted Deposit and Withdrawal*) handles cases where the Anchor needs a web-based form — identity verification, bank details, amount selection — before processing a transaction. The Anchor serves an interactive URL; the wallet opens it in a popup or iframe and listens for completion events.

The full flow is:

1. Discover the Anchor's endpoints via `stellar.toml`.
2. Authenticate with the Anchor using SEP-10 to obtain a JWT.
3. Initiate the deposit or withdrawal to receive an interactive URL and a transaction ID.
4. Open the URL for the user; handle the completion message.
5. Poll for the final transaction status.

---

## Step 1 — Discovery via `stellar.toml`

Every Anchor publishes a TOML file at `/.well-known/stellar.toml` on their home domain. Fetch it to find the SEP-24 endpoint:

```js
import { StellarToml } from "@stellar/stellar-sdk";

async function discoverAnchor(homeDomain) {
  const toml = await StellarToml.Resolver.resolve(homeDomain);

  const transferServer = toml.TRANSFER_SERVER_SEP0024;
  if (!transferServer) {
    throw new Error(`${homeDomain} does not support SEP-24`);
  }

  return {
    transferServer,
    webAuthEndpoint: toml.WEB_AUTH_ENDPOINT,
    signingKey: toml.SIGNING_KEY,
  };
}
```

---

## Step 2 — SEP-10 Authentication

SEP-24 requires a JWT issued by the Anchor's SEP-10 web auth service. The challenge-response flow works as follows:

```js
import { WebAuth, Networks } from "@stellar/stellar-sdk";

async function getAnchorJwt(webAuthEndpoint, signingKey, userKeypair, networkPassphrase) {
  // 1. Fetch the challenge transaction from the Anchor
  const challengeRes = await fetch(
    `${webAuthEndpoint}?account=${userKeypair.publicKey()}`
  );
  const { transaction: challengeXdr } = await challengeRes.json();

  // 2. Verify the challenge is well-formed and signed by the Anchor
  const { tx } = WebAuth.readChallengeTx(
    challengeXdr,
    signingKey,
    networkPassphrase,
    new URL(webAuthEndpoint).hostname,
    new URL(webAuthEndpoint).hostname
  );

  // 3. Sign the challenge with the user's key
  tx.sign(userKeypair);

  // 4. Submit the signed challenge to receive a JWT
  const tokenRes = await fetch(webAuthEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transaction: tx.toEnvelope().toXDR("base64") }),
  });
  const { token } = await tokenRes.json();
  return token;
}
```

---

## Step 3 — Initiating a Deposit

Send `POST /transactions/deposit/interactive` with the asset code and the user's Stellar account. The Anchor responds with an interactive `url` and a `transaction.id`:

```js
async function startDeposit(transferServer, jwt, assetCode, userPublicKey) {
  const body = new URLSearchParams({
    asset_code: assetCode,
    account: userPublicKey,
  });

  const res = await fetch(`${transferServer}/transactions/deposit/interactive`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Deposit initiation failed: ${err.error}`);
  }

  const { type, url, id } = await res.json();
  if (type !== "interactive_customer_info_needed") {
    throw new Error(`Unexpected response type: ${type}`);
  }

  return { url, transactionId: id };
}
```

For **withdrawals**, use `POST /transactions/withdraw/interactive` with the same shape. Add `dest` and `dest_extra` fields for the destination bank account when required.

---

## Step 4 — Client-Side Handling: Popup and Window Message

Open the interactive URL in a popup and listen for the `stellar_wc` postMessage that signals the user has completed the form:

```js
function openAnchorPopup(url) {
  return new Promise((resolve, reject) => {
    const popup = window.open(url, "anchorFlow", "width=600,height=800");
    if (!popup) {
      reject(new Error("Popup blocked. Ask the user to allow popups for this site."));
      return;
    }

    function onMessage(event) {
      // Only accept messages from the Anchor's origin
      const anchorOrigin = new URL(url).origin;
      if (event.origin !== anchorOrigin) return;

      const { transaction_id } = event.data;
      if (transaction_id) {
        window.removeEventListener("message", onMessage);
        popup.close();
        resolve(transaction_id);
      }
    }

    window.addEventListener("message", onMessage);

    // Detect if the user closes the popup manually
    const closedCheck = setInterval(() => {
      if (popup.closed) {
        clearInterval(closedCheck);
        window.removeEventListener("message", onMessage);
        reject(new Error("User closed the Anchor window before completing."));
      }
    }, 500);
  });
}
```

---

## Step 5 — Polling for Transaction Status

After the popup closes, poll `GET /transaction?id=<id>` until the status resolves:

```js
const TERMINAL_STATES = new Set(["completed", "error", "expired", "no_market", "too_small", "too_large", "refunded"]);
const POLL_INTERVAL_MS = 5_000;

async function pollTransaction(transferServer, jwt, transactionId) {
  while (true) {
    const res = await fetch(`${transferServer}/transaction?id=${transactionId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const { transaction } = await res.json();

    console.log(`Status: ${transaction.status}`);

    if (TERMINAL_STATES.has(transaction.status)) {
      return transaction;
    }

    // For statuses like "pending_user_transfer_start", instruct the user to send funds
    if (transaction.status === "pending_user_transfer_start") {
      console.log("Waiting for user to send funds to:", transaction.withdraw_anchor_account);
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}
```

Common non-terminal statuses: `pending_user_transfer_start`, `pending_anchor`, `pending_stellar`, `pending_external`, `pending_customer_info_update`.

---

## Edge Cases

**Timeout / no activity.** If the user opens the popup but takes no action, the Anchor may expire the session. The transaction status becomes `expired`. Show an appropriate message and offer to restart.

**KYC pending.** The Anchor may return `pending_customer_info_update` and a `more_info_url`. Redirect the user back to that URL to complete identity verification, then resume polling.

**User abandonment.** If the popup closes without a `stellar_wc` message, the transaction may still exist in a `pending_*` state server-side. Poll once after abandonment to determine if the Anchor recorded any progress.

**Memo requirements.** For deposits to custodial wallets (exchanges), the Anchor may require a `memo` on the incoming Stellar payment. Check `transaction.withdraw_memo` and `transaction.withdraw_memo_type` before building the payment transaction.

**Amount limits.** The `stellar.toml` `CURRENCIES` section lists `deposit_fee_fixed`, `deposit_fee_percent`, `deposit_min_amount`, and `deposit_max_amount`. Validate on the client before initiating to avoid `too_small` / `too_large` errors.

---

## Full Flow at a Glance

```js
async function sep24Deposit(homeDomain, assetCode, userKeypair) {
  const { transferServer, webAuthEndpoint, signingKey } = await discoverAnchor(homeDomain);
  const jwt = await getAnchorJwt(webAuthEndpoint, signingKey, userKeypair, Networks.TESTNET);
  const { url, transactionId } = await startDeposit(transferServer, jwt, assetCode, userKeypair.publicKey());

  // Open interactive window; wait for user to complete the form
  await openAnchorPopup(url);

  // Poll until settled
  const finalTx = await pollTransaction(transferServer, jwt, transactionId);
  console.log("Deposit settled:", finalTx.status, finalTx.amount_in);
  return finalTx;
}
```

---

## Notes

- The SEP-10 JWT typically expires in 24 hours. Refresh it if polling spans multiple sessions.
- For server-side or CLI contexts where popups are unavailable, print the URL and instruct the user to visit it manually; then resume polling.
- Always verify the Anchor's `SIGNING_KEY` against the `stellar.toml` before trusting the challenge transaction.

**Related:** [Soroban Integration](/docs/integrations/soroban), [Horizon Integration](/docs/integrations/horizon), [Asset Compliance Flags](/routes-d/504-asset-compliance-flags)
