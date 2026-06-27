---
title: Multi-Network Development Guide
description: A comprehensive guide to configuring and switching between Stellar Testnet, Futurenet, and Mainnet, including environment management, RPC endpoints, and common pitfalls
---

# Multi-Network Development Guide

Stellar applications typically run against three networks during their lifecycle: **Futurenet** (experimental features), **Testnet** (stable pre-production), and **Mainnet** (production). Each network has its own passphrase, accounts, balances, and contract deployments — configuration drift between them is one of the most common sources of hard-to-diagnose bugs.

---

## Network Reference

| Network       | Passphrase                                       | Horizon                                 | Soroban RPC                           | Friendbot                                 |
| ------------- | ------------------------------------------------ | --------------------------------------- | ------------------------------------- | ----------------------------------------- |
| **Mainnet**   | `Public Global Stellar Network ; September 2015` | `https://horizon.stellar.org`           | `https://mainnet.sorobanrpc.com`      | ❌ Not available                          |
| **Testnet**   | `Test SDF Network ; September 2015`              | `https://horizon-testnet.stellar.org`   | `https://soroban-testnet.stellar.org` | `https://friendbot.stellar.org`           |
| **Futurenet** | `Test SDF Future Network ; October 2022`         | `https://horizon-futurenet.stellar.org` | `https://rpc-futurenet.stellar.org`   | `https://friendbot-futurenet.stellar.org` |

The `@stellar/stellar-sdk` exports these as constants:

```typescript
import { Networks } from '@stellar/stellar-sdk';

Networks.PUBLIC; // Mainnet passphrase
Networks.TESTNET; // Testnet passphrase
Networks.FUTURENET; // Futurenet passphrase
```

---

## Environment Configuration

Store all network-specific values in environment variables — never hardcode them:

```bash
# .env.testnet
STELLAR_NETWORK=testnet
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
HORIZON_URL=https://horizon-testnet.stellar.org
SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
CONTRACT_ID=CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4

# .env.mainnet
STELLAR_NETWORK=mainnet
STELLAR_NETWORK_PASSPHRASE="Public Global Stellar Network ; September 2015"
HORIZON_URL=https://horizon.stellar.org
SOROBAN_RPC_URL=https://mainnet.sorobanrpc.com
CONTRACT_ID=CBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBSC4
```

Use a network config resolver that reads these at startup:

```typescript
import { Networks } from '@stellar/stellar-sdk';

export interface NetworkConfig {
  networkPassphrase: string;
  horizonUrl: string;
  sorobanRpcUrl: string;
  contractId: string;
  friendbotUrl?: string;
}

export function resolveNetworkConfig(): NetworkConfig {
  const network = process.env.STELLAR_NETWORK ?? 'testnet';

  switch (network) {
    case 'mainnet':
      return {
        networkPassphrase: Networks.PUBLIC,
        horizonUrl: process.env.HORIZON_URL ?? 'https://horizon.stellar.org',
        sorobanRpcUrl:
          process.env.SOROBAN_RPC_URL ?? 'https://mainnet.sorobanrpc.com',
        contractId: requireEnv('CONTRACT_ID'),
      };
    case 'futurenet':
      return {
        networkPassphrase: Networks.FUTURENET,
        horizonUrl:
          process.env.HORIZON_URL ?? 'https://horizon-futurenet.stellar.org',
        sorobanRpcUrl:
          process.env.SOROBAN_RPC_URL ?? 'https://rpc-futurenet.stellar.org',
        contractId: requireEnv('CONTRACT_ID'),
        friendbotUrl: 'https://friendbot-futurenet.stellar.org',
      };
    case 'testnet':
    default:
      return {
        networkPassphrase: Networks.TESTNET,
        horizonUrl:
          process.env.HORIZON_URL ?? 'https://horizon-testnet.stellar.org',
        sorobanRpcUrl:
          process.env.SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org',
        contractId: requireEnv('CONTRACT_ID'),
        friendbotUrl: 'https://friendbot.stellar.org',
      };
  }
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value)
    throw new Error(`Required environment variable ${key} is not set`);
  return value;
}
```

---

## Initialising SDK Clients

Pass the resolved config into all SDK clients to avoid any hardcoded network assumptions:

```typescript
import { Horizon, SorobanRpc, Networks } from '@stellar/stellar-sdk';

const config = resolveNetworkConfig();

// Horizon client
const horizonServer = new Horizon.Server(config.horizonUrl);

// Soroban RPC client
const sorobanServer = new SorobanRpc.Server(config.sorobanRpcUrl, {
  allowHttp: config.horizonUrl.startsWith('http://'), // local dev only
});
```

Always pass `networkPassphrase` when building or verifying transactions:

```typescript
import { TransactionBuilder } from '@stellar/stellar-sdk';

const account = await horizonServer.loadAccount(publicKey);
const tx = new TransactionBuilder(account, {
  fee: '1000',
  networkPassphrase: config.networkPassphrase, // ← critical
})
  .addOperation(/* ... */)
  .setTimeout(30)
  .build();
```

---

## Managing Accounts Across Networks

Accounts are **not shared** between networks. A keypair that exists on Testnet has zero balance on Mainnet and vice versa.

### Testnet / Futurenet Account Funding

```typescript
async function fundTestnetAccount(
  publicKey: string,
  friendbotUrl: string
): Promise<void> {
  const res = await fetch(
    `${friendbotUrl}?addr=${encodeURIComponent(publicKey)}`
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Friendbot failed: ${res.status} ${body}`);
  }
}

// Usage
if (config.friendbotUrl) {
  await fundTestnetAccount(keypair.publicKey(), config.friendbotUrl);
}
```

### Mainnet Account Funding

Mainnet accounts must be funded via a real XLM transfer — minimum 1 XLM to meet the base reserve.

---

## Soroban Contract Deployments

Contract IDs are **network-specific**. A contract deployed to Testnet has a different ID on Mainnet. Treat contract IDs as environment config, not constants:

```typescript
// ✅ Correct — from environment
const contractId = requireEnv('CONTRACT_ID');

// ❌ Wrong — hardcoded
const contractId = 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABSC4';
```

Track deployments per network in a config file:

```json
{
  "contracts": {
    "testnet": {
      "my_contract": "CTEST..."
    },
    "mainnet": {
      "my_contract": "CMAIN..."
    }
  }
}
```

---

## Runtime Network Switching

For applications that support multiple networks simultaneously (e.g., a wallet), use a context-based approach:

```typescript
import { createContext, useContext } from "react";

const NetworkContext = createContext<NetworkConfig | null>(null);

export function NetworkProvider({ network, children }: { network: string; children: React.ReactNode }) {
  const config = useMemo(() => resolveNetworkConfig(network), [network]);
  return <NetworkContext.Provider value={config}>{children}</NetworkContext.Provider>;
}

export function useNetwork(): NetworkConfig {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error("useNetwork must be used inside NetworkProvider");
  return ctx;
}
```

---

## Common Pitfalls

### 1. Wrong Network Passphrase

A transaction signed with the wrong passphrase will fail signature verification even if every other field is correct. The error (`tx_bad_auth`) appears on-chain but gives no indication the passphrase is the cause.

```typescript
// ❌ Common mistake
tx.sign(keypair); // signs for whatever the SDK default is

// ✅ Always sign after building with the correct passphrase
const tx = new TransactionBuilder(account, {
  networkPassphrase: config.networkPassphrase,
}).build();
tx.sign(keypair);
```

### 2. Testnet Contract ID on Mainnet

Contract IDs look similar across networks. Pasting a Testnet ID into a Mainnet config produces an opaque `contract_not_found` error.

**Fix**: use separate `.env` files and load them explicitly per deployment target.

### 3. Sequence Number Mismatch After Network Switch

If you cache account objects, switching networks will use stale sequence numbers from the previous network.

```typescript
// Always reload the account from the current network's Horizon
const account = await horizonServer.loadAccount(publicKey);
```

### 4. Futurenet Reset

Futurenet is periodically reset, wiping all accounts, balances, and contracts. Never store persistent data on Futurenet. Testnet is reset roughly quarterly — treat it similarly.

### 5. Fee Differences

Mainnet base fees during congestion can be significantly higher than Testnet. Use fee bump transactions and set reasonable `maxFee` values:

```typescript
const tx = new TransactionBuilder(account, {
  fee: '10000', // 0.001 XLM — sufficient for most operations
  networkPassphrase: config.networkPassphrase,
}).build();
```

---

## CI/CD Network Strategy

| Environment       | Network | Notes                      |
| ----------------- | ------- | -------------------------- |
| Unit tests        | Mocked  | No real network calls      |
| Integration tests | Testnet | Funded via Friendbot in CI |
| Staging           | Testnet | Shared Testnet deployment  |
| Production        | Mainnet | Real funds, real users     |

Example GitHub Actions matrix:

```yaml
jobs:
  integration:
    runs-on: ubuntu-latest
    env:
      STELLAR_NETWORK: testnet
      CONTRACT_ID: ${{ secrets.TESTNET_CONTRACT_ID }}
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration
```

---

## Network Health Checks

Before running operations, optionally verify the chosen network is reachable:

```typescript
async function checkNetworkHealth(config: NetworkConfig): Promise<void> {
  const [horizonRes, rpcRes] = await Promise.all([
    fetch(`${config.horizonUrl}/`).then((r) => r.ok),
    fetch(`${config.sorobanRpcUrl}/`)
      .then((r) => r.ok)
      .catch(() => false),
  ]);

  if (!horizonRes)
    throw new Error(`Horizon at ${config.horizonUrl} is unreachable`);
  if (!rpcRes)
    console.warn(`Soroban RPC at ${config.sorobanRpcUrl} may be unreachable`);
}
```

---

## Related Resources

- [SEP-10 Authentication Flow](/docs/guides/sep10-authentication-flow)
- [Disaster Recovery Guide](/docs/guides/disaster-recovery-keys-accounts)
- [Horizon Integration](/docs/integrations/horizon)
- [Soroban Event Indexing](/docs/guides/soroban-event-indexing)
