---
title: SEP-10 Authentication Flow
description: A complete walkthrough of the SEP-10 Stellar Web Authentication standard, covering challenge generation, client-side signing, server verification, and JWT token lifecycle
---

# SEP-10 Authentication Flow

SEP-10 (Stellar Web Authentication) is the standard mechanism for Stellar-based services to authenticate users without passwords. A client proves ownership of a Stellar account by signing a server-issued challenge transaction. The server verifies the signature and issues a JWT that gates subsequent API calls.

---

## Overview

The full SEP-10 flow has four stages:

1. **Challenge** — client requests a challenge transaction from the server
2. **Sign** — client signs the transaction with their Stellar keypair
3. **Submit** — client posts the signed transaction back to the server
4. **Token** — server verifies signatures and returns a JWT

```
Client                              Server (Anchor/Service)
  |                                       |
  |-- GET /auth?account=G... -----------> |
  |<-- { transaction: "xdr..." } -------- |
  |                                       |
  | [sign transaction locally]            |
  |                                       |
  |-- POST /auth { transaction: "xdr..." }|
  |<-- { token: "eyJ..." } -------------- |
  |                                       |
  |-- GET /api/resource                   |
  |   Authorization: Bearer eyJ...        |
```

---

## Step 1 — Request a Challenge Transaction

The client sends a `GET` request to the server's `/auth` endpoint with the account public key as a query parameter.

```http
GET /auth?account=GBHYD4QJHXGS46GVNXWDL3M3MKKQ5P7RBXHQKZ7E5FXBFQZFVNWUSVP
```

**Optional parameters:**

| Parameter       | Description                                                        |
| --------------- | ------------------------------------------------------------------ |
| `account`       | G… public key of the account to authenticate (required)            |
| `memo`          | 64-bit integer memo for muxed accounts                             |
| `home_domain`   | Service domain, used when multiple domains share one auth endpoint |
| `client_domain` | Domain of the client application (for client domain verification)  |

The server responds with a Stellar transaction in XDR envelope format:

```json
{
  "transaction": "AAAAAgAAAABx...base64-encoded-xdr...AAAAAAAAAAA=",
  "network_passphrase": "Public Global Stellar Network ; September 2015"
}
```

### What the Challenge Transaction Contains

The server constructs a challenge transaction with these properties:

- **Source account**: the server's signing key (not the client's account)
- **Sequence number**: `0` — makes the transaction invalid for ledger submission
- **Time bounds**: a narrow validity window (typically 15 minutes)
- **Operations**: at minimum one `manageData` operation with:
  - Key: `<home_domain> auth`
  - Value: 64 bytes of cryptographically random data (the nonce)
- Additional `manageData` operations for `web_auth_domain`, client domain verification, and memo if applicable

```typescript
import {
  TransactionBuilder,
  Networks,
  Operation,
  Keypair,
} from '@stellar/stellar-sdk';

function buildChallenge(
  serverKeypair: Keypair,
  clientPublicKey: string,
  homeDomain: string
) {
  const account = new StellarSdk.Account(serverKeypair.publicKey(), '-1');
  const now = Math.floor(Date.now() / 1000);

  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: Networks.PUBLIC,
  })
    .addOperation(
      Operation.manageData({
        source: clientPublicKey,
        name: `${homeDomain} auth`,
        value: crypto.getRandomValues(new Uint8Array(64)),
      })
    )
    .addOperation(
      Operation.manageData({
        source: serverKeypair.publicKey(),
        name: 'web_auth_domain',
        value: homeDomain,
      })
    )
    .setTimebounds(now, now + 900) // 15-minute window
    .build();

  tx.sign(serverKeypair);
  return tx.toEnvelope().toXDR('base64');
}
```

---

## Step 2 — Client-Side Signing

The client decodes the XDR, verifies its contents, signs it with their keypair, and re-encodes it.

```typescript
import { TransactionBuilder, Networks, Keypair } from '@stellar/stellar-sdk';

async function signChallenge(
  xdr: string,
  clientKeypair: Keypair,
  networkPassphrase: string
): Promise<string> {
  const tx = TransactionBuilder.fromXDR(xdr, networkPassphrase);

  // Verify before signing
  validateChallenge(tx);

  tx.sign(clientKeypair);
  return tx.toEnvelope().toXDR('base64');
}
```

### Client-Side Validation Checks

Before signing, the client **must** verify:

1. The transaction source account is the server's signing key (not their own)
2. The sequence number is `0`
3. The time bounds are present and the current time falls within them
4. The first operation is `manageData` with source set to the client's account
5. The operation key matches `<expected_home_domain> auth`
6. The `web_auth_domain` operation value matches the expected domain

```typescript
function validateChallenge(tx: Transaction) {
  if (tx.sequence !== '0') {
    throw new Error('Challenge sequence number must be 0');
  }
  const now = Math.floor(Date.now() / 1000);
  if (
    !tx.timeBounds ||
    now < Number(tx.timeBounds.minTime) ||
    now > Number(tx.timeBounds.maxTime)
  ) {
    throw new Error('Challenge time bounds are invalid or expired');
  }
  const firstOp = tx.operations[0];
  if (firstOp.type !== 'manageData') {
    throw new Error('First operation must be manageData');
  }
  if (!firstOp.name.endsWith(' auth')) {
    throw new Error("Challenge operation key does not end with ' auth'");
  }
}
```

---

## Step 3 — Submit the Signed Transaction

The client posts the signed transaction XDR to the server's `/auth` endpoint:

```http
POST /auth
Content-Type: application/json

{
  "transaction": "AAAAAgAAAABx...signed-xdr...AAAAAAAAAAA="
}
```

---

## Step 4 — Server Verification and Token Issuance

The server verifies the submitted transaction:

1. Decode the XDR and confirm the transaction is structurally valid
2. Verify the server's own signature is present and valid
3. Extract the client's account from the first `manageData` source
4. Verify the client account's signature is present and valid
5. Check time bounds have not expired
6. Confirm the nonce has not been seen before (replay protection)
7. Issue a JWT

```typescript
import { TransactionBuilder, Networks } from '@stellar/stellar-sdk';
import jwt from 'jsonwebtoken';

async function verifyAndIssueToken(
  signedXdr: string,
  serverPublicKey: string,
  jwtSecret: string
): Promise<string> {
  const tx = TransactionBuilder.fromXDR(signedXdr, Networks.PUBLIC);

  // 1. Sequence must be 0
  if (tx.sequence !== '0') throw new Error('Invalid sequence');

  // 2. Time bounds
  const now = Math.floor(Date.now() / 1000);
  if (now > Number(tx.timeBounds?.maxTime))
    throw new Error('Challenge expired');

  // 3. Server signature
  const serverSigned = tx.signatures.some((sig) =>
    Keypair.fromPublicKey(serverPublicKey).verify(tx.hash(), sig.signature())
  );
  if (!serverSigned) throw new Error('Missing server signature');

  // 4. Client account and signature
  const firstOp = tx.operations[0] as ManageDataOperation;
  const clientPublicKey = firstOp.source!;
  const clientSigned = tx.signatures.some((sig) =>
    Keypair.fromPublicKey(clientPublicKey).verify(tx.hash(), sig.signature())
  );
  if (!clientSigned) throw new Error('Missing client signature');

  // 5. Issue JWT (sub = client account, exp = now + 24h)
  return jwt.sign(
    { sub: clientPublicKey, iss: 'https://example-anchor.com' },
    jwtSecret,
    { expiresIn: '24h' }
  );
}
```

The server responds with:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Token Lifecycle

### Storage

Store the JWT in memory or `sessionStorage` for web clients. Avoid `localStorage` for high-security applications — it is accessible to any JavaScript on the page.

```typescript
class AuthTokenStore {
  private token: string | null = null;
  private expiresAt: number = 0;

  set(token: string) {
    this.token = token;
    // Decode expiry from JWT payload without verification
    const payload = JSON.parse(atob(token.split('.')[1]));
    this.expiresAt = payload.exp * 1000;
  }

  get(): string | null {
    if (Date.now() >= this.expiresAt) {
      this.token = null;
    }
    return this.token;
  }

  isValid(): boolean {
    return this.token !== null && Date.now() < this.expiresAt;
  }

  clear() {
    this.token = null;
    this.expiresAt = 0;
  }
}
```

### Renewal

Re-authenticate before the token expires to avoid interrupting user flows:

```typescript
async function getValidToken(
  store: AuthTokenStore,
  keypair: Keypair
): Promise<string> {
  if (store.isValid()) return store.get()!;

  const { transaction, network_passphrase } = await fetchChallenge(
    keypair.publicKey()
  );
  const signed = await signChallenge(transaction, keypair, network_passphrase);
  const { token } = await submitChallenge(signed);
  store.set(token);
  return token;
}
```

---

## Multi-Signature Accounts

For accounts with multiple signers, all required signers must sign the challenge transaction before submission. Collect signatures out-of-band and merge them before posting to `/auth`.

```typescript
function mergeSignatures(
  baseXdr: string,
  additionalXdr: string,
  networkPassphrase: string
): string {
  const baseTx = TransactionBuilder.fromXDR(baseXdr, networkPassphrase);
  const additionalTx = TransactionBuilder.fromXDR(
    additionalXdr,
    networkPassphrase
  );

  for (const sig of additionalTx.signatures) {
    baseTx.signatures.push(sig);
  }
  return baseTx.toEnvelope().toXDR('base64');
}
```

The server checks that the combined weight of present signers meets the account's threshold for the `manageData` operation type.

---

## Edge Cases and Error Handling

| Scenario                               | Server Response    | Client Action           |
| -------------------------------------- | ------------------ | ----------------------- |
| Challenge expired (time bounds passed) | `400 Bad Request`  | Request a new challenge |
| Missing client signature               | `400 Bad Request`  | Re-sign and resubmit    |
| Replay attack (nonce reuse)            | `400 Bad Request`  | Request a new challenge |
| Account does not exist on ledger       | `400 Bad Request`  | Fund the account first  |
| JWT expired on subsequent requests     | `401 Unauthorized` | Re-authenticate         |
| Clock skew > 5 minutes                 | `400 Bad Request`  | Sync client clock       |

---

## Security Considerations

- **Nonce uniqueness**: servers must store used nonces for the duration of the time bounds window to prevent replay attacks
- **Time bounds**: keep the challenge window short (≤ 15 minutes) to limit exposure
- **HTTPS only**: the challenge exchange must happen over TLS; a MITM could substitute a malicious challenge
- **Signature verification order**: always verify the server's signature before the client's to confirm the challenge is authentic
- **JWT secret rotation**: use asymmetric signing (RS256) for JWTs in production so the verification key can be published without exposing the signing key

---

## Related Resources

- [Stellar Anchors and SEP-24](/docs/guides/stellar-anchors-sep24)
- [SEP-31 Cross-Border Payments](/docs/guides/sep31-cross-border-payments)
- [Horizon Integration](/docs/integrations/horizon)
