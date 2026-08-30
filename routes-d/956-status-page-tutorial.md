# Issue #956 — Build a complete Stellar dApp status page tutorial

Working draft for the docs change requested in issue #956.

## Planned doc location

- `docs/guides/status-page.mdx`

## Scope

- Explain why a Stellar dApp needs a status page beyond a regular web app
- Cover uptime signals: Horizon health, Soroban RPC, smart contract reachability
- Note maintenance windows and how to communicate them
- Provide a working sample using a minimal Next.js page that polls Horizon's `/health` endpoint
- Match the existing MDX frontmatter and writing style

## Sections

### Why a Status Page Matters for Stellar dApps
- On-chain dependencies (Horizon, Soroban RPC) can fail independently of your frontend
- Users need to distinguish "my wallet is broken" from "the dApp is down"

### Uptime Signals to Track
- Horizon `/health` — liveness of the Horizon server
- Soroban RPC `/health` — liveness of the Soroban RPC node
- Smart contract reachability — a lightweight simulation call
- Your own API / backend (if any)

### Maintenance Windows
- Communicating planned downtime before it happens
- Using a banner in the UI
- Scheduling around Stellar protocol upgrades

### Working Sample
- Minimal Next.js API route that polls all signals
- React component that renders a coloured badge per signal

## Acceptance Criteria
- Builds with `pnpm build:content` without errors
- Internal links pass `pnpm check:links`
