# Issue #206 — Create a page listing all available components

Working draft for the docs change requested in issue #206.

## Planned doc location

- `docs/components/index.mdx`

## Scope

- Single index page listing every available component
- Each entry: component name, one-line description, link to its dedicated page
- Group by category (UI, wallet, data display)

## Draft content

```mdx
---
title: Components
description: A complete list of all Nextellar UI and wallet components
---

# Components

Nextellar ships a set of pre-built React components designed for Stellar dApps.
Each component is fully typed and works out of the box with `WalletProvider`.

## Wallet

| Component | Description |
|-----------|-------------|
| [WalletConnectButton](./wallet-connect-button) | One-click wallet connection modal |
| [WalletProvider](./wallet-provider) | Context provider — wrap your app root |

## Planned components

Additional components are tracked in the [feature backlog](https://github.com/nextellarlabs/nextellar/issues).
```

## Notes

- This page acts as the entry point for the `/docs/components/` section.
- Expand the table as new components ship; keep descriptions to one line each.
