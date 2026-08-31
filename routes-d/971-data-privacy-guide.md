# Issue #971 — Add a comprehensive Stellar dApp data privacy guide

Working draft for the docs change requested in issue #971.

## Planned doc location

- `docs/guides/data-privacy.mdx`

## Scope

- Cover data classification for a Stellar dApp (on-chain vs. off-chain)
- Note retention rules for each data category
- Provide a small policy template teams can adapt
- Match the existing MDX frontmatter and writing style

## Sections

### Data Classification
- On-chain data (public key, transaction history) — immutable and always public
- Off-chain identifiable data (email, IP address)
- Off-chain non-identifiable data (aggregate analytics)
- Wallet session data

### Retention Rules
- On-chain: no retention needed — data lives on ledger forever
- Email / contact: retain until user requests deletion
- IP logs: 30–90 days recommended
- Analytics: anonymised after 12 months

### Policy Template
- Minimal policy checklist
- Key clauses for Stellar-specific data flows

## Acceptance Criteria
- Builds with `pnpm build:content` without errors
- Internal links pass `pnpm check:links`
