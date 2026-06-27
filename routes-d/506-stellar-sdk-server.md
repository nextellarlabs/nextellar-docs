---
title: Documenting the Stellar SDK Server Class
description: Construction, configuration, common queries, and error handling for the Horizon Server class.
---

# Stellar SDK Server Class

The `Server` class in the Stellar SDK is the primary entry point for interacting with a Horizon instance (Stellar's REST API). It allows you to query ledger data, submit transactions, and stream events.

---

## Construction and Configuration

To initialize a `Server` instance, import it from the Stellar SDK and provide the Horizon endpoint URL. For private networks or custom Horizon endpoints, you can supply optional configurations.

```javascript
import { Server } from '@stellar/stellar-sdk';

// Connecting to the public Testnet Horizon server
const server = new Server('https://horizon-testnet.stellar.org');

// Configuration options can be passed to manage timeouts and custom headers
const customServer = new Server('https://horizon.custom-endpoint.com', {
  allowHttp: false, // Force HTTPS
  timeout: 30000,   // Timeout in milliseconds
});
```

---

## Common Queries

Here are examples of query patterns supported by the `Server` instance:

### 1. Fetching Account Details
Retrieve account balances, sequence number, and signers.

```javascript
async function getAccountInfo(accountId) {
  try {
    const account = await server.loadAccount(accountId);
    console.log('Sequence Number:', account.sequenceNumber());
    console.log('Balances:', account.balances);
  } catch (error) {
    console.error('Failed to load account:', error);
  }
}
```

### 2. Querying Transactions
Search for transaction history filtered by accounts or ledgers.

```javascript
async function getTransactions(accountId) {
  try {
    const transactions = await server.transactions()
      .forAccount(accountId)
      .limit(10)
      .order('desc')
      .call();
    console.log('Recent transactions:', transactions.records);
  } catch (error) {
    console.error('Failed to query transactions:', error);
  }
}
```

---

## Error Handling Tips

Horizon queries can fail due to rate limiting, network partitions, or bad request payloads. Always wrap server queries in robust try-catch blocks and inspect Horizon response codes:

- **404 Not Found**: Commonly occurs when querying an account that has not been funded yet (requires at least 1 XLM reserve).
- **429 Too Many Requests**: Horizon instances typically apply rate limiting. Respect `Retry-After` headers where available.
- **Bad Requests**: Inspect the `error.response?.data?.extras` field for detailed transaction errors when operations fail validation.
