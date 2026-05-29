# Issue #193 — Add cross links between related hook pages

Working draft for the docs change requested in issue #193.

## Planned doc locations

All files under `docs/hooks/`.

## Scope

- Identify natural groupings among the hook pages
- Add a **Related hooks** section at the bottom of each page
- Links should be accurate relative MDX paths

## Hook relationship map

| Hook | Related hooks |
|------|--------------|
| `useStellarWallet` | `useStellarBalances`, `useStellarPayment`, `WalletProvider`, `WalletConnectButton` |
| `useStellarBalances` | `useStellarWallet`, `useTrustlines` |
| `useStellarPayment` | `useStellarWallet`, `useTransactionHistory` |
| `useSorobanContract` | `useSorobanEvents` |
| `useSorobanEvents` | `useSorobanContract` |
| `useTransactionHistory` | `useStellarPayment`, `useStellarWallet` |
| `useTrustlines` | `useStellarBalances`, `useStellarWallet` |
| `useOfferBook` | `useStellarWallet` |
| `WalletProvider` | `useStellarWallet`, `WalletConnectButton` |
| `WalletConnectButton` | `WalletProvider`, `useStellarWallet` |

## Draft section to append to each hook page

```mdx
## Related hooks

- [useStellarWallet](./use-stellar-wallet) — wallet connection and account management
- [useStellarBalances](./use-stellar-balances) — fetch and refresh account balances
```

Adjust the list per the relationship map above for each individual page.

## Notes

- Use relative paths (e.g. `./use-stellar-wallet`) so links resolve correctly in
  any deployment base path.
- Run `pnpm check:links` after adding links to confirm no broken references.
