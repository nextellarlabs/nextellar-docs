# Issue #972 — Build a complete Stellar dApp GDPR compliance tutorial

Working draft for the docs change requested in issue #972.

## Planned doc location

- `docs/guides/gdpr-compliance.mdx`

## Scope

- Cover the data subject rights that apply to a Stellar dApp (access, erasure, portability, etc.)
- Note record-keeping requirements (Article 30 processing records)
- Provide a small compliance checklist teams can work through before launch
- Match the existing MDX frontmatter and writing style

## Sections

### Who GDPR Applies To
- Any dApp with EU users, regardless of where the team is based
- Stellar's public ledger and the "right to erasure" tension

### Data Subject Rights
- Right of access (Article 15)
- Right to erasure (Article 17) — and its limits on-chain
- Right to rectification (Article 16)
- Right to data portability (Article 20)
- Right to object to processing (Article 21)

### Record Keeping (Article 30)
- What a Record of Processing Activities (RoPA) must contain
- Minimal RoPA template for a Stellar dApp

### Pre-Launch Compliance Checklist

## Acceptance Criteria
- Builds with `pnpm build:content` without errors
- Internal links pass `pnpm check:links`
