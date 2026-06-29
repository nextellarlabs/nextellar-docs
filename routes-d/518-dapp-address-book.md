---
title: Building an Address Book for a Stellar dApp
description: Storage choices, UI flow, and a sample data model for a contact address book feature inside a Stellar dApp
---

# Building an Address Book for a Stellar dApp

An address book lets users save and label Stellar public keys instead of copying 56-character strings every time. This guide covers storage choices, a simple UI flow, and a sample data model.

---

## Storage Choices

| Option | Best When | Trade-offs |
|---|---|---|
| **Browser `localStorage`** | Single-device, no server | Data lost if user clears storage; not synced across devices |
| **IndexedDB** | Larger books, offline-first | More complex API; still single-device |
| **Server-side (user account)** | Multi-device sync needed | Requires auth and a backend; adds infrastructure |
| **On-chain (Soroban storage)** | Fully decentralised, no backend | Gas cost per entry; data is public unless encrypted |

For most dApps, `localStorage` is the fastest starting point. Migrate to server-side storage once you need multi-device sync.

---

## Sample Data Model

```ts
/** A single address book entry. */
export interface Contact {
  id: string;           // UUID, generated on creation
  label: string;        // Human-readable name, e.g. "Alice — Treasury"
  publicKey: string;    // Stellar G-address (56 chars)
  memo?: string;        // Optional default memo for payments to this contact
  tags?: string[];      // Optional tags for grouping, e.g. ["vendor", "payroll"]
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
}
```

Store the book as an array of `Contact` objects serialised to JSON:

```ts
const STORAGE_KEY = "stellar_address_book";

function loadContacts(): Contact[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Contact[];
  } catch {
    return [];
  }
}

function saveContacts(contacts: Contact[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}
```

---

## Simple UI Flow

```
┌──────────────────────────────────────────┐
│ Address Book                       [+ Add]│
├──────────────────────────────────────────┤
│ 🔍 Search contacts…                       │
├──────────────────────────────────────────┤
│ Alice — Treasury   GABC…XYZ   [Copy][Edit]│
│ Bob — Payroll      GDEF…UVW   [Copy][Edit]│
└──────────────────────────────────────────┘
        │
        │ [+ Add] clicked
        ▼
┌──────────────────────────────────────────┐
│ Add Contact                              │
│ Label:      [                          ] │
│ Public Key: [                          ] │
│ Memo:       [                          ] │
│ Tags:        vendor  payroll  [+ add]    │
│                          [Cancel] [Save] │
└──────────────────────────────────────────┘
```

1. **List view** — shows all saved contacts with a search bar that filters by label or partial key.
2. **Add/Edit modal** — collects label, public key, optional memo and tags.
3. **Validation** — validate the public key with `StrKey.isValidEd25519PublicKey` before saving.
4. **Copy** — one-click copy of the public key to clipboard.

---

## Example: Add and Look Up a Contact

```ts
import { StrKey } from "@stellar/stellar-sdk";
import { v4 as uuidv4 } from "uuid";

function addContact(
  contacts: Contact[],
  label: string,
  publicKey: string,
  memo?: string,
): Contact[] {
  if (!StrKey.isValidEd25519PublicKey(publicKey)) {
    throw new Error(`Invalid Stellar public key: ${publicKey}`);
  }
  if (contacts.some((c) => c.publicKey === publicKey)) {
    throw new Error("A contact with this public key already exists");
  }
  const now = new Date().toISOString();
  const contact: Contact = {
    id: uuidv4(),
    label: label.trim(),
    publicKey,
    memo,
    createdAt: now,
    updatedAt: now,
  };
  const updated = [...contacts, contact];
  saveContacts(updated);
  return updated;
}

function findByLabel(contacts: Contact[], query: string): Contact[] {
  const lower = query.toLowerCase();
  return contacts.filter(
    (c) =>
      c.label.toLowerCase().includes(lower) ||
      c.publicKey.toLowerCase().includes(lower),
  );
}
```

---

## Notes

- **Validate on save, not on display** — always validate keys before persisting them. Display whatever is stored (it was already validated).
- **No private keys in the address book** — the book stores only public keys; warn users clearly if they accidentally paste a secret key.
- **Export / import** — offer a JSON export so users can back up their book and restore it on a new device.

**Related:** [Reading Account Flags](/routes-d/485-reading-account-flags), [Managing Trustline Limits](/routes-d/509-managing-trustline-limits), [Resilient Transaction Submission](/routes-d/513-resilient-transaction-submission)
