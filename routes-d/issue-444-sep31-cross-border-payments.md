---
title: SEP-31 Cross-Border Payments
description: A comprehensive guide to the SEP-31 direct payment standard for anchors, covering the complete payment lifecycle, sender and receiver roles, KYC fields, and error handling
---

# SEP-31 Cross-Border Payments

SEP-31 (Cross-Border Payments API) is the Stellar Ecosystem Proposal for direct anchor-to-anchor transfers. Unlike SEP-24 (which involves an interactive user flow), SEP-31 is a non-interactive, API-driven protocol designed for business-to-business and remittance corridors.

---

## Roles

| Role                 | Description                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| **Sending Anchor**   | Receives fiat from the sender, converts to Stellar assets, and calls the receiving anchor's SEP-31 API |
| **Receiving Anchor** | Receives Stellar assets, performs KYC/compliance checks, and disburses fiat to the recipient           |
| **Sender**           | Individual or business initiating the payment (interacts only with the sending anchor)                 |
| **Recipient**        | Individual or business receiving funds (interacts only with the receiving anchor)                      |

The sending anchor acts as the SEP-31 _client_; the receiving anchor acts as the SEP-31 _server_.

---

## Discovery: stellar.toml

The sending anchor discovers the receiving anchor's capabilities by fetching their `stellar.toml`:

```
GET https://receiving-anchor.example/.well-known/stellar.toml
```

Relevant fields:

```toml
TRANSFER_SERVER_SEP0031 = "https://receiving-anchor.example/sep31"
WEB_AUTH_ENDPOINT = "https://receiving-anchor.example/auth"
SIGNING_KEY = "GBHYD4...server-signing-key..."

[[CURRENCIES]]
code = "USDC"
issuer = "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
```

---

## Payment Lifecycle

```
Sending Anchor                          Receiving Anchor
     |                                       |
     |-- GET /info --------------------------> |
     |<-- { receive, fields, fee } ---------- |
     |                                       |
     |-- POST /auth (SEP-10) --------------> |
     |<-- { token: JWT } ------------------- |
     |                                       |
     |-- POST /transactions -------------->  |
     |   { asset, amount, fields }           |
     |<-- { id, stellar_account_id, memo } - |
     |                                       |
     | [send Stellar payment]                |
     |                                       |
     |-- GET /transactions/:id ------------> |
     |<-- { status, ... } ------------------ |
```

---

## Step 1 — Fetch Info

```http
GET /sep31/info
```

Response:

```json
{
  "receive": {
    "USDC": {
      "enabled": true,
      "fee_fixed": 0.25,
      "fee_percent": 0,
      "min_amount": 1,
      "max_amount": 10000,
      "sep12": {
        "sender": {
          "types": {
            "sep31-sender": {
              "description": "Individual sending a payment"
            }
          }
        },
        "receiver": {
          "types": {
            "sep31-receiver": {
              "description": "Individual receiving a payment"
            }
          }
        }
      },
      "fields": {
        "transaction": {
          "routing_number": {
            "description": "US bank routing number",
            "optional": false
          },
          "account_number": {
            "description": "Recipient bank account number",
            "optional": false
          },
          "type": {
            "description": "Payment type",
            "choices": ["ACH", "WIRE"],
            "optional": false
          }
        }
      }
    }
  }
}
```

---

## Step 2 — Authenticate (SEP-10)

Before creating transactions, the sending anchor must authenticate using SEP-10:

```typescript
async function authenticate(
  receivingAnchorUrl: string,
  sendingAnchorKeypair: Keypair
): Promise<string> {
  const { transaction, network_passphrase } = await fetch(
    `${receivingAnchorUrl}/auth?account=${sendingAnchorKeypair.publicKey()}`
  ).then((r) => r.json());

  const tx = TransactionBuilder.fromXDR(transaction, network_passphrase);
  tx.sign(sendingAnchorKeypair);

  const { token } = await fetch(`${receivingAnchorUrl}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction: tx.toEnvelope().toXDR('base64') }),
  }).then((r) => r.json());

  return token;
}
```

---

## Step 3 — Submit KYC via SEP-12

If the receiving anchor requires KYC, submit sender and receiver information via SEP-12 before creating the transaction:

```typescript
async function submitKyc(
  sep12Url: string,
  token: string,
  customerId: string,
  fields: Record<string, string>
): Promise<string> {
  const body = new FormData();
  body.append('id', customerId);
  for (const [key, value] of Object.entries(fields)) {
    body.append(key, value);
  }

  const res = await fetch(`${sep12Url}/customer`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  const data = await res.json();
  return data.id; // SEP-12 customer ID
}
```

Common sender fields:

| Field             | Description                               |
| ----------------- | ----------------------------------------- |
| `first_name`      | Legal first name                          |
| `last_name`       | Legal last name                           |
| `email_address`   | Contact email                             |
| `address`         | Full street address                       |
| `date_of_birth`   | ISO 8601 date                             |
| `id_type`         | Document type (passport, drivers_license) |
| `id_number`       | Document number                           |
| `id_country_code` | ISO 3166-1 alpha-3 country code           |

---

## Step 4 — Create the Transaction

```http
POST /sep31/transactions
Authorization: Bearer <jwt>
Content-Type: application/json
```

Request body:

```json
{
  "amount": "100.00",
  "asset_code": "USDC",
  "asset_issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  "receiver_id": "d2b763cc-3418-4e7a-9b5e-f42a9e4a9a72",
  "sender_id": "a2e4b12c-8d3f-4e9a-b1f3-c7d2e4f6a8b0",
  "fields": {
    "transaction": {
      "routing_number": "021000021",
      "account_number": "9876543210",
      "type": "ACH"
    }
  }
}
```

Successful response (`201 Created`):

```json
{
  "id": "5f3a7c2e-1b4d-4e8a-9c6f-2d7b8e1a3f5c",
  "stellar_account_id": "GBHYD4QJHXGS46GVNXWDL3M3MKKQ5P7RBXHQKZ7E5FXBFQZFVNWUSVP",
  "stellar_memo_type": "hash",
  "stellar_memo": "base64-encoded-hash"
}
```

---

## Step 5 — Send the Stellar Payment

The sending anchor submits a Stellar path payment or simple payment to the `stellar_account_id` with the specified memo:

```typescript
import {
  Asset,
  Memo,
  Networks,
  Operation,
  TransactionBuilder,
} from '@stellar/stellar-sdk';

async function sendPayment(
  senderKeypair: Keypair,
  destinationAccount: string,
  memo: string,
  memoType: 'hash' | 'text' | 'id',
  amount: string,
  assetCode: string,
  assetIssuer: string
) {
  const server = new Horizon.Server('https://horizon.stellar.org');
  const account = await server.loadAccount(senderKeypair.publicKey());
  const asset = new Asset(assetCode, assetIssuer);

  const memoObj =
    memoType === 'hash'
      ? Memo.hash(Buffer.from(memo, 'base64'))
      : memoType === 'text'
        ? Memo.text(memo)
        : Memo.id(memo);

  const tx = new TransactionBuilder(account, {
    fee: '1000',
    networkPassphrase: Networks.PUBLIC,
  })
    .addOperation(
      Operation.payment({
        destination: destinationAccount,
        asset,
        amount,
      })
    )
    .addMemo(memoObj)
    .setTimeout(60)
    .build();

  tx.sign(senderKeypair);
  return server.submitTransaction(tx);
}
```

---

## Step 6 — Poll Transaction Status

Poll until the transaction reaches a terminal state:

```typescript
type Sep31Status =
  | 'pending_sender'
  | 'pending_stellar'
  | 'pending_customer_info_update'
  | 'pending_receiver'
  | 'pending_external'
  | 'completed'
  | 'error';

async function pollTransaction(
  sep31Url: string,
  token: string,
  transactionId: string
): Promise<void> {
  const terminalStates: Sep31Status[] = ['completed', 'error'];

  while (true) {
    const res = await fetch(`${sep31Url}/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { transaction } = await res.json();

    console.log(`Status: ${transaction.status}`);

    if (terminalStates.includes(transaction.status)) {
      if (transaction.status === 'error') {
        throw new Error(`Transaction failed: ${transaction.message}`);
      }
      break;
    }

    await new Promise((r) => setTimeout(r, 5000));
  }
}
```

---

## Transaction Status Reference

| Status                         | Meaning                                            | Next Action                  |
| ------------------------------ | -------------------------------------------------- | ---------------------------- |
| `pending_sender`               | Waiting for sending anchor to send Stellar payment | Submit payment               |
| `pending_stellar`              | Stellar payment submitted, awaiting confirmation   | Wait                         |
| `pending_customer_info_update` | Receiver needs more KYC info                       | Submit updated SEP-12 fields |
| `pending_receiver`             | Receiving anchor is processing the disbursement    | Wait                         |
| `pending_external`             | Waiting for external payout (bank transfer)        | Wait                         |
| `completed`                    | Funds delivered to recipient                       | Done                         |
| `error`                        | Unrecoverable error                                | Check `message` field        |

---

## Compliance and KYC Fields

The `fields` object in `/info` describes which transaction-level fields are required. KYC fields for individuals are handled via SEP-12. The receiving anchor may request additional information mid-flow by moving the transaction to `pending_customer_info_update`.

```typescript
async function handleKycUpdate(
  sep12Url: string,
  token: string,
  transaction: any
): Promise<void> {
  if (transaction.status !== 'pending_customer_info_update') return;

  // Fetch which fields are now required
  const receiver = await fetch(
    `${sep12Url}/customer?id=${transaction.receiver_id}&type=sep31-receiver`,
    { headers: { Authorization: `Bearer ${token}` } }
  ).then((r) => r.json());

  const missingFields = Object.entries(receiver.fields as Record<string, any>)
    .filter(([, v]) => v.optional === false && !v.status)
    .map(([k]) => k);

  console.log('Missing KYC fields:', missingFields);
  // Collect and submit the missing fields via SEP-12 PUT /customer
}
```

---

## Error Handling

| HTTP Status | Meaning                                                          |
| ----------- | ---------------------------------------------------------------- |
| `400`       | Invalid request (missing fields, amount out of range)            |
| `401`       | JWT missing or expired — re-authenticate                         |
| `403`       | Sending anchor not permitted (check `stellar.toml` restrictions) |
| `404`       | Transaction ID not found                                         |
| `429`       | Rate limited — back off and retry                                |

On `400`, the response body contains a `error` string and optional `fields` map indicating which request parameters were invalid.

---

## Related Resources

- [SEP-10 Authentication Flow](/docs/guides/sep10-authentication-flow)
- [Stellar Anchors and SEP-24](/docs/guides/stellar-anchors-sep24)
- [Horizon Integration](/docs/integrations/horizon)
