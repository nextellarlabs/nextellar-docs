---
title: Friendbot Rate Limits
description: Known rate limits for the Stellar Friendbot testnet funding service and how to handle them
---

# Friendbot Rate Limits

Friendbot is a Stellar testnet service that creates and funds accounts with free test XLM. Because it is a shared public resource, it enforces rate limits to prevent abuse.

---

## Typical Limits

Friendbot does not publish an exact rate limit, but in practice you should expect:

- **One request per account** — funding the same address a second time returns an error because the account already exists.
- **Throttling under load** — during heavy testnet usage, requests may be delayed or rejected with a `429 Too Many Requests` response.

---

## Common Error Responses

| Status | Meaning |
|--------|---------|
| `400 Bad Request` | The account already exists on testnet. |
| `429 Too Many Requests` | You have hit the rate limit. Wait before retrying. |
| `500 Internal Server Error` | Transient Friendbot issue. Retry after a short delay. |

---

## Retry Suggestion

Use exponential backoff when automating Friendbot calls in test scripts:

```js
async function fundAccount(publicKey, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(
      `https://friendbot.stellar.org?addr=${publicKey}`
    );
    if (res.ok) return await res.json();
    if (res.status === 400) break; // account already exists, no point retrying
    await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
  }
  throw new Error("Friendbot funding failed");
}
```

**Related:** [Horizon Integration](/docs/integrations/horizon), [Testing](/docs/integrations/testing)
