# Issue #962 — Build a complete Stellar dApp privacy policy template tutorial

Working draft for the docs change requested in issue #962.

## Planned doc location

- `docs/guides/privacy-policy.mdx`

## Scope

- Explain data flows unique to Stellar dApps (public ledger, wallet keys)
- Cover common privacy policy sections required in most jurisdictions
- Note what data is collected by the app vs. visible on-chain
- Provide a small starter template teams can copy and customise
- Match the existing MDX frontmatter and writing style

## Sections

### Stellar-Specific Data Flows
- Public key as pseudonymous identifier
- On-chain transaction history
- Third-party services (Horizon, Soroban RPC)

### Common Privacy Policy Sections
- Data controller identity
- What data is collected and why
- On-chain vs. off-chain data distinction
- User rights (GDPR / CCPA)
- Cookie and analytics policy
- Data retention

### What to Describe per Integration
- Horizon calls — IP address logging
- Wallet connection — public key only, no private key
- Analytics — if applicable

### Starter Template

## Acceptance Criteria

- Content builds with `pnpm build:content` without errors
- Internal links pass `pnpm check:links`
- Reviewed and approved by a maintainer before merge
