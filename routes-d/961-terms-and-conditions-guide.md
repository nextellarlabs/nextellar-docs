# Issue #961 — Add a comprehensive Stellar dApp terms and conditions template guide

Working draft for the docs change requested in issue #961.

## Planned doc location

- `docs/guides/terms-and-conditions.mdx`

## Scope

- Explain why a Stellar dApp needs its own terms and conditions
- Cover the common sections every dApp T&C should include
- Note when and how to adapt the template (jurisdiction, token type, etc.)
- Provide a small starter template teams can copy and customise
- Match the existing MDX frontmatter and writing style

## Sections

### Why dApps Need Custom Terms
- Smart contract immutability implications
- Wallet-based identity vs. account-based identity
- Regulatory considerations for token issuers

### Common T&C Sections
- Acceptance of terms
- Description of service
- Eligibility and KYC
- Token / asset disclaimers
- Dispute resolution and governing law

### When to Adapt the Template
- Different jurisdictions
- Securities vs. utility tokens
- Custodial vs. non-custodial flows

### Starter Template

## Acceptance Criteria

- Content builds with `pnpm build:content` without errors
- Internal links pass `pnpm check:links`
- Reviewed and approved by a maintainer before merge
