---
title: Soroban Gas Estimation Guide
description: Step-by-step guide for estimating and tuning gas and execution resource costs in Soroban smart contracts.
---

# Soroban Gas Estimation Guide

Soroban contracts consume CPU instructions and memory (metaphorically referred to as gas or execution resources). Accurate estimation ensures transaction success and prevents over-budget rejections.

---

## Cost Measurement Steps

To estimate gas/execution costs for a Soroban transaction:

1. **Dry-Run (Simulate)**: Submit your transaction to the Soroban RPC `simulateTransaction` endpoint. This executes the contract in a sandbox and returns the exact CPU instructions, memory footprint, and ledger reads/writes.
2. **Extract Resources**: Read the `results` and `transactionData` fields from the simulation response.
3. **Inject Limits**: Build the final transaction, configuring the execution resource limits to match (or slightly exceed) the simulated amounts.

---

## Common Cost Drivers

- **Ledger Storage**: Reading and writing ledger entries (persistent or temporary storage) are the most expensive resource consumers. Keep your data footprints compact.
- **CPU Instructions**: Highly complex loops, cryptographic operations, or recursive functions increase CPU utilization.
- **Wasm Bytecode Size**: Compiling large contracts or importing heavy third-party dependencies increases the contract upload cost and execution loading fee.

---

## Small Example

Here is a JavaScript example demonstrating how to estimate resources using Soroban RPC simulation:

```javascript
import { rpc, TransactionBuilder, Networks } from '@stellar/stellar-sdk';

const server = new rpc.Server('https://soroban-testnet.stellar.org');

async function estimateAndSubmit(tx) {
  // 1. Simulate the transaction
  const simulation = await server.simulateTransaction(tx);
  
  if (rpc.Api.isSimulationSuccess(simulation)) {
    console.log('Estimated CPU Instructions:', simulation.results[0].events);
    
    // 2. Assemble the transaction with the simulated resource footprint
    const finalTx = rpc.assembleTransaction(tx, simulation).build();
    
    // 3. Submit transaction
    const response = await server.sendTransaction(finalTx);
    return response;
  } else {
    throw new Error('Simulation failed: ' + simulation.error);
  }
}
```
