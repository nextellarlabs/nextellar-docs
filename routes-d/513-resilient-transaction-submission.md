---
title: Resilient Transaction Submission
description: Implementing retry with exponential backoff and leveraging Stellar idempotency to achieve resilient transaction submission.
---

# Resilient Transaction Submission

When interacting with the Stellar network, temporary network failures or Horizon rate limits can cause transaction submission attempts to fail. Implementing resilient submission patterns ensures high availability and robustness for your applications.

---

## Idempotency of Stellar Transactions

Stellar transactions are naturally idempotent. Every transaction has a cryptographic hash uniquely identifying it. If a transaction has already been applied to the ledger:
- Re-submitting the exact same transaction envelope will return the original successful result without applying the operation again.
- It is completely safe to retry submitting the same signed envelope.

---

## Retry with Exponential Backoff

To avoid overwhelming Horizon servers during a temporary outage, implement an exponential backoff retry strategy. Start with a small delay and increase the wait time on each subsequent failure.

---

## Small Example

Here is a simple Javascript implementation of resilient submission:

```javascript
async function submitResiliently(server, transaction, maxRetries = 5) {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await server.submitTransaction(transaction);
      console.log('Transaction successfully submitted:', response.hash);
      return response;
    } catch (error) {
      attempt++;
      const isRateLimited = error.response?.status === 429;
      const isServerError = error.response?.status >= 500;
      
      if ((isRateLimited || isServerError) && attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff in ms
        console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Re-throw if unrecoverable or out of retry attempts
      }
    }
  }
}
```
