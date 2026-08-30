# Issue #964 — Build a complete Stellar dApp bug bounty program tutorial

Working draft for the docs change requested in issue #964.

## Planned doc location

- `docs/guides/bug-bounty.mdx`

## Scope

- Explain why a bug bounty program matters for a Stellar dApp
- Cover scope definition (in-scope / out-of-scope assets)
- Explain payout tiers keyed to CVSS severity
- Note reporting channels and response SLAs
- Provide a small program-rules template teams can adapt
- Match the existing MDX frontmatter and writing style

## Sections

### Why Run a Bug Bounty?
- Smart contracts are immutable — prevention matters more than patching
- Community incentives for responsible disclosure
- Trust signal for users and auditors

### Defining Scope
- In-scope: smart contracts, backend API, web frontend
- Out-of-scope: third-party services, social engineering

### Payout Tiers
- Critical / High / Medium / Low mapped to CVSS score ranges
- Example XLM payout ranges

### Reporting Channels
- Security email / GitHub Security Advisory
- Disclosure timeline expectations

### Program Rules Template

## Acceptance Criteria

- Content builds with `pnpm build:content` without errors
- Internal links pass `pnpm check:links`
- Reviewed and approved by a maintainer before merge
