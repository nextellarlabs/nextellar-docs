---
title: Storing User Preferences Off Chain
description: Compare off-chain storage options for dApp user preferences, privacy considerations, and a small implementation example
---

# Storing User Preferences Off Chain

dApps often need to remember UI settings — theme, locale, notification toggles, slippage tolerance — that do not belong on the public Stellar ledger. Storing preferences off chain keeps transactions cheap, avoids permanent exposure of personal choices, and sidesteps the 64-byte `ManageData` limit. This guide compares common approaches and notes the privacy trade-offs for each.

---

## Option Comparison

| Storage                   | Persistence       | Sync across devices | Privacy                       | Best for                                  |
| ------------------------- | ----------------- | ------------------- | ----------------------------- | ----------------------------------------- |
| **sessionStorage**        | Tab session only  | No                  | Highest (cleared on close)    | Wallet connection state, ephemeral UI     |
| **localStorage**          | Until cleared     | No                  | Medium (device-local)         | Theme, language, dismissed banners        |
| **IndexedDB**             | Until cleared     | No                  | Medium                        | Larger structured prefs, offline caches   |
| **Backend database**      | Server-controlled | Yes                 | Lower (links wallet to prefs) | Cross-device settings, account dashboards |
| **Encrypted backend**     | Server-controlled | Yes                 | Medium–high                   | PII-adjacent prefs with user consent      |
| **IPFS / decentralized**  | Content-addressed | Yes (with pinning)  | Varies                        | Portable, user-owned preference blobs     |
| **ManageData (on-chain)** | Permanent, public | Yes                 | Lowest                        | Protocol flags only — not UI preferences  |

For most dApps, **localStorage for device-local UI** plus an **optional encrypted backend** for signed-in users covers the common cases without putting preference data on the ledger.

---

## Privacy Considerations

- **Wallet correlation**: Storing `{ publicKey → preferences }` in your backend links a user's on-chain history to their settings. Collect only what you need and offer deletion.
- **Public ledger alternative**: `ManageData` entries are visible to anyone who reads the account from Horizon. Never store emails, names, or other PII on-chain.
- **Third-party analytics**: Sending preference changes to analytics tools can leak behavioral data. Keep analytics payloads coarse-grained (e.g. `"theme: dark"`) rather than full preference objects.
- **Cross-site leakage**: `localStorage` is origin-scoped. Subdomains and iframes cannot read each other's storage — but do not embed third-party scripts that can read the DOM alongside wallet addresses.

Prefer session-scoped storage for anything tied to an active wallet session:

```ts
// Cleared when the tab closes — safer for wallet-linked state
export const sessionPrefs = {
  get: (key: string) => sessionStorage.getItem(`pref:${key}`),
  set: (key: string, value: string) =>
    sessionStorage.setItem(`pref:${key}`, value),
  clear: () => {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith('pref:'))
      .forEach((k) => sessionStorage.removeItem(k));
  },
};
```

---

## Local Preference Store

```ts
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  locale: string;
  slippageBps: number;
  notifications: { payments: boolean; governance: boolean };
}

const DEFAULTS: UserPreferences = {
  theme: 'system',
  locale: 'en',
  slippageBps: 50,
  notifications: { payments: true, governance: false },
};

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem('nextellar:prefs');
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function savePreferences(prefs: Partial<UserPreferences>) {
  const merged = { ...loadPreferences(), ...prefs };
  localStorage.setItem('nextellar:prefs', JSON.stringify(merged));
  return merged;
}
```

---

## Optional Backend Sync

When users opt in to cross-device sync, key preferences by public key and require a SEP-10 or wallet signature before writing:

```ts
// app/api/preferences/route.ts
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const { publicKey, preferences, signedMessage } = await request.json();

  // Verify the user controls publicKey (SEP-10 token or signed challenge)
  if (!(await verifyWalletAuth(publicKey, signedMessage))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.preferences.upsert({
    where: { publicKey },
    update: { data: preferences, updatedAt: new Date() },
    create: { publicKey, data: preferences },
  });

  return NextResponse.json({ ok: true });
}

export async function GET(request: Request) {
  const publicKey = new URL(request.url).searchParams.get('publicKey');
  if (!publicKey)
    return NextResponse.json({ error: 'Missing publicKey' }, { status: 400 });

  const row = await db.preferences.findUnique({ where: { publicKey } });
  return NextResponse.json(row?.data ?? {});
}
```

Store only non-sensitive UI settings server-side. Keep KYC data in a separate, access-controlled table.

---

## Small Example: React Hook

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from '@/lib/preferences';

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(loadPreferences);

  useEffect(() => {
    savePreferences(prefs);
  }, [prefs]);

  const update = useCallback((patch: Partial<UserPreferences>) => {
    setPrefs((current) => ({ ...current, ...patch }));
  }, []);

  return { prefs, update };
}

// Usage
function SettingsPanel() {
  const { prefs, update } = usePreferences();

  return (
    <label>
      Slippage tolerance (%)
      <input
        type="number"
        value={prefs.slippageBps / 100}
        onChange={(e) => update({ slippageBps: Number(e.target.value) * 100 })}
      />
    </label>
  );
}
```

---

## Notes

- On-chain `ManageData` is appropriate for protocol-visible flags (home domain, federation hints), not for UI toggles — see [Manage Data Operation](/routes-d/487-manage-data-operation).
- Export and delete endpoints help meet privacy regulations when you store preferences server-side.
- Version your preference schema (`prefsVersion: 2`) so migrations do not corrupt stored JSON.

**Related:** [Privacy Considerations](/docs/guides/privacy-considerations), [Manage Data Operation](/routes-d/487-manage-data-operation), [Horizon Integration](/docs/integrations/horizon)
