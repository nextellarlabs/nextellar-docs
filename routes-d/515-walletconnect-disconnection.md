---
title: Graceful WalletConnect Disconnection
description: How to handle WalletConnect session disconnects in a Stellar dApp, including the disconnect flow, state cleanup, and a working example
---

# Graceful WalletConnect Disconnection

WalletConnect sessions can end either by user action (explicit disconnect) or unexpectedly (wallet app closed, session timeout). Handling both cases cleanly prevents stale state and avoids broken UI.

---

## Disconnect Flow

1. **User-initiated:** user clicks "Disconnect" in the dApp or wallet → the SDK emits a `session_delete` event on both sides.
2. **Wallet-initiated:** the wallet terminates the session → the dApp receives a `session_delete` event from the WalletConnect relay.
3. **Network/timeout:** the relay connection drops → no event is delivered; the dApp must detect staleness on the next interaction.

---

## State Cleanup

When a disconnect is detected, clear all session-derived state:

- Connected public key / account address
- Session topic
- Signed-in status flags
- Any cached balances or transaction history tied to that session

---

## Example

```js
import { WalletConnect } from "@walletconnect/web3wallet";
import { useState, useEffect } from "react";

export function useWalletSession(walletConnectClient) {
  const [publicKey, setPublicKey] = useState(null);
  const [sessionTopic, setSessionTopic] = useState(null);

  useEffect(() => {
    if (!walletConnectClient) return;

    // Listen for wallet-initiated or relay-initiated disconnects
    walletConnectClient.on("session_delete", ({ topic }) => {
      if (topic === sessionTopic) {
        clearSession();
      }
    });

    return () => {
      walletConnectClient.off("session_delete");
    };
  }, [walletConnectClient, sessionTopic]);

  function clearSession() {
    setPublicKey(null);
    setSessionTopic(null);
    // Clear any localStorage/sessionStorage entries
    sessionStorage.removeItem("wc_session_topic");
    sessionStorage.removeItem("stellar_public_key");
  }

  async function disconnect() {
    if (!sessionTopic) return;
    try {
      await walletConnectClient.disconnectSession({
        topic: sessionTopic,
        reason: { code: 6000, message: "User disconnected" },
      });
    } finally {
      // Always clear local state even if the remote call fails
      clearSession();
    }
  }

  return { publicKey, setPublicKey, setSessionTopic, disconnect };
}
```

---

## Notes

- Always clear local state in a `finally` block — the remote disconnect call can fail if the relay is down, but local state should still be cleaned up.
- If the dApp restores sessions from storage on page reload, validate that the stored session topic is still active with `walletConnectClient.getActiveSessions()` before treating the user as connected.
- For mobile wallets that go to background, sessions can silently expire; add a connectivity check before every transaction submission.

**Related:** [Horizon Integration](/docs/integrations/horizon)
