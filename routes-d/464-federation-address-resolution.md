---
title: Stellar Address Resolution via Federation
description: How Stellar federation maps human-readable addresses to public keys
---

# Stellar Address Resolution via Federation

Federation is a Stellar protocol that lets users share a short, human-readable address instead of a long public key.

---

## Address Format

A federated address looks like an email address:

```
alice*example.com
```

The part before `*` is the user identifier and the part after is the domain hosting the federation server.

---

## How Lookups Work

1. The client queries the domain's `stellar.toml` file to find the federation server URL.
2. It sends an HTTP GET request to that server with the address as a parameter.
3. The server responds with the Stellar public key (and optionally a memo) linked to that address.

```
GET https://federation.example.com/?q=alice*example.com&type=name
```

A successful response returns the account ID:

```json
{
  "stellar_address": "alice*example.com",
  "account_id": "GABC...XYZ"
}
```

---

## Using Federation in Nextellar

Pass the resolved `account_id` wherever a public key is required. Nextellar does not resolve federated addresses automatically — perform the lookup before calling hooks like `useStellarPayment`.

**Related:** [Horizon Integration](/docs/integrations/horizon), [Wallets](/docs/integrations/wallets)
