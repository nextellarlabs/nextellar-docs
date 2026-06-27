---
title: Disaster Recovery Guide for Keys and Accounts
description: A comprehensive guide to backing up Stellar keys, recovering accounts, rotating compromised signers, and running periodic recovery drills
---

# Disaster Recovery Guide for Keys and Accounts

Stellar accounts are controlled entirely by cryptographic keys. There is no password reset, no central authority to contact, and no recovery email. Losing access to your signing keys means losing access to your funds and contracts permanently — unless you planned ahead.

This guide covers backup strategies, secure storage, signer rotation, multi-sig recovery, compromised key response, and periodic drills.

---

## Key Types and What They Control

| Key Type                           | Controls                               | Loss Consequence                            |
| ---------------------------------- | -------------------------------------- | ------------------------------------------- |
| **Master key** (secret key `S...`) | All account operations by default      | Full account loss if no other signers       |
| **Additional signers**             | Specific thresholds (low/medium/high)  | Partial loss depending on threshold weights |
| **Soroban contract admin key**     | Contract upgrades and admin operations | Permanent loss of upgrade ability           |

---

## Backup Strategies

### 1. Offline Paper Backup

Generate keys in an air-gapped environment and write the secret key on paper. Store copies in geographically separate locations (e.g., home safe + bank deposit box).

```typescript
import { Keypair } from '@stellar/stellar-sdk';

// Generate offline — never expose secret key to networked systems
const keypair = Keypair.random();
console.log('Public key:', keypair.publicKey());
console.log('SECRET KEY — STORE OFFLINE:', keypair.secret());
```

**Do:**

- Use acid-free paper and a permanent marker
- Laminate the backup
- Store in a fireproof, waterproof container

**Do not:**

- Screenshot or photograph the key
- Store in cloud storage (iCloud, Google Drive, Dropbox)
- Email the key to yourself

### 2. Hardware Wallet

Ledger Nano and Trezor support Stellar. The secret key never leaves the device.

### 3. Encrypted Digital Backup

If an offline paper backup is impractical, encrypt the secret key before storing digitally:

```bash
# Encrypt
echo "SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" | \
  gpg --symmetric --cipher-algo AES256 --output stellar_key.gpg

# Decrypt when needed
gpg --decrypt stellar_key.gpg
```

Store the encrypted file in cold storage (USB drive, offline disk) and keep the GPG passphrase in a separate secure location (password manager or physical safe).

### 4. Shamir's Secret Sharing

For high-value accounts, split the secret key into N shares where any M shares (M < N) can reconstruct the original:

```typescript
import { split, combine } from 'shamir-secret-sharing';

const key = Buffer.from(keypair.secret(), 'utf8');
const shares = split(key, { shares: 5, threshold: 3 });

// Distribute shares to 5 trusted custodians
// Any 3 can reconstruct the key
const recovered = combine(shares.slice(0, 3));
const secret = recovered.toString('utf8');
```

---

## Multi-Signature Recovery Setup

Multi-sig is the most resilient structure for high-value Stellar accounts. Set up recovery signers before you need them.

### Recommended Threshold Configuration

```typescript
import { Operation, TransactionBuilder } from '@stellar/stellar-sdk';

// Set thresholds and add recovery signers
const tx = new TransactionBuilder(account, {
  fee: '1000',
  networkPassphrase: Networks.PUBLIC,
})
  .addOperation(
    Operation.setOptions({
      // Master key weight — reduce to 1 so it cannot act alone on high-threshold ops
      masterWeight: 1,
      // Thresholds
      lowThreshold: 1, // balance query ops
      medThreshold: 2, // payments, trust ops
      highThreshold: 3, // signer changes, account merge
      // Primary signer
      signer: { ed25519PublicKey: primarySignerPublicKey, weight: 2 },
    })
  )
  .addOperation(
    Operation.setOptions({
      // Recovery signer (hardware wallet or separate custody)
      signer: { ed25519PublicKey: recoverySignerPublicKey, weight: 2 },
    })
  )
  .setTimeout(30)
  .build();
```

With this setup:

- Normal operations require the primary signer (weight 2, meets medThreshold)
- High-threshold operations require primary + recovery signer (total weight 4, meets highThreshold 3)
- Recovery is possible with just the recovery signer for most operations

---

## Signer Rotation

Rotate signers when:

- A signer key may be compromised
- An employee with signer access departs
- Scheduled key rotation policy triggers

### Step-by-Step Rotation

```typescript
async function rotateSigner(
  account: AccountResponse,
  oldPublicKey: string,
  newPublicKey: string,
  allCurrentSignerKeypairs: Keypair[],
  networkPassphrase: string
): Promise<void> {
  const tx = new TransactionBuilder(account, {
    fee: '1000',
    networkPassphrase,
  })
    // Add new signer with same weight as old
    .addOperation(
      Operation.setOptions({
        signer: { ed25519PublicKey: newPublicKey, weight: 2 },
      })
    )
    // Remove old signer (weight 0 = remove)
    .addOperation(
      Operation.setOptions({
        signer: { ed25519PublicKey: oldPublicKey, weight: 0 },
      })
    )
    .setTimeout(30)
    .build();

  // Must meet high threshold to change signers — requires multiple signatures
  for (const keypair of allCurrentSignerKeypairs) {
    tx.sign(keypair);
  }

  const server = new Horizon.Server('https://horizon.stellar.org');
  await server.submitTransaction(tx);
}
```

**Order matters**: always add the new signer before removing the old one. If the remove operation lands without the add, you may lock yourself out.

---

## Compromised Key Response

If you suspect a key has been compromised, act immediately — Stellar transactions are irreversible.

### Incident Response Checklist

1. **Assess exposure** — check Horizon for recent transactions from the account

   ```bash
   curl "https://horizon.stellar.org/accounts/<PUBLIC_KEY>/transactions?order=desc&limit=10"
   ```

2. **Freeze operations** (if possible) — set account home domain to a page indicating the account is under review, and remove the compromised key

3. **Add new signer first** — use your recovery signer to add a new clean keypair

   ```typescript
   // Use recovery keypair (not the compromised one) to sign this
   Operation.setOptions({
     signer: { ed25519PublicKey: newKeypair.publicKey(), weight: 2 },
   });
   ```

4. **Remove compromised key** — only after the new key is confirmed on-chain

   ```typescript
   Operation.setOptions({
     signer: { ed25519PublicKey: compromisedPublicKey, weight: 0 },
   });
   ```

5. **Sweep funds** — if the account was a hot wallet, move funds to a clean account before or during the rotation

6. **Rotate all derived secrets** — API keys, JWT secrets, and webhook tokens that were stored alongside the compromised key

7. **Post-incident review** — document the timeline, entry vector, and remediation steps

---

## Soroban Contract Admin Key Recovery

If the admin key for a Soroban contract is lost, the contract is permanently frozen in its current configuration. Prevent this:

### Prevention: Multi-Sig Admin

Deploy contracts with a multi-sig admin address rather than a single key:

```rust
#[contractimpl]
impl MyContract {
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }
}
```

Set `admin` to a Stellar account with multiple signers, so no single key loss bricks the contract.

### Prevention: Timelock Guardian

Add a secondary address with a time-delayed override for emergency access:

```rust
pub fn emergency_override(env: Env, caller: Address) {
    caller.require_auth();
    let guardian: Address = env.storage().instance().get(&DataKey::Guardian).unwrap();
    if caller != guardian {
        panic!("not guardian");
    }
    let unlock_time: u64 = env.storage().instance().get(&DataKey::UnlockTime).unwrap();
    if env.ledger().timestamp() < unlock_time {
        panic!("timelock not expired");
    }
    // Grant temporary admin access
}
```

---

## Periodic Recovery Drills

A backup you have never tested is a backup you cannot trust. Run drills on a schedule:

### Quarterly Drill Checklist

```
[ ] Locate all physical key backups — confirm they are readable and undamaged
[ ] Verify digital encrypted backups can be decrypted with the stored passphrase
[ ] Test recovering a Testnet account from backup keys only
[ ] Confirm all signers can sign a test transaction and it meets thresholds
[ ] Verify contract admin key can invoke a non-destructive admin operation on Testnet
[ ] Update the incident-response runbook if anything has changed
[ ] Rotate any keys that are older than the organisation's rotation policy
```

### Automated Backup Verification

Run a lightweight CI job that proves the backup workflow is intact without exposing real keys:

```typescript
// test/recovery-drill.test.ts (Testnet only)
it('can reconstruct account from backup keypair and sign a transaction', async () => {
  const backupSecret = process.env.TESTNET_BACKUP_KEY!;
  const keypair = Keypair.fromSecret(backupSecret);

  const server = new Horizon.Server('https://horizon-testnet.stellar.org');
  const account = await server.loadAccount(keypair.publicKey());

  // Build a no-op transaction (set_options with no changes) to verify signing works
  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.setOptions({}))
    .setTimeout(30)
    .build();

  tx.sign(keypair);
  const result = await server.submitTransaction(tx);
  expect(result.successful).toBe(true);
});
```

---

## Key Storage Security Tiers

| Tier   | Storage                | Use Case                 | Risk                                 |
| ------ | ---------------------- | ------------------------ | ------------------------------------ |
| Hot    | In-memory / env var    | Automated payments, APIs | High — exposed if server compromised |
| Warm   | Encrypted file on disk | Signing service with HSM | Medium                               |
| Cold   | Hardware wallet        | High-value signers       | Low                                  |
| Frozen | Paper / offline        | Emergency recovery only  | Very low                             |

Keep the minimum key weight needed for daily operations in the hot tier. Recovery and high-threshold keys should never touch an internet-connected system during normal operations.

---

## Related Resources

- [Multi-Network Development Guide](/docs/guides/multi-network-development)
- [SEP-10 Authentication Flow](/docs/guides/sep10-authentication-flow)
- [Mainnet Launch Checklist](/docs/guides/mainnet-launch-checklist)
- [Horizon Integration](/docs/integrations/horizon)
