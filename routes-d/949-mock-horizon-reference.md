# Issue #949 — Add a comprehensive Stellar mock Horizon reference guide

Working draft for the docs change requested in issue #949.

## Planned doc location

- `docs/guides/mock-horizon.mdx`

## Scope

- Explain why a mock Horizon service is useful for local development
- Cover endpoint fidelity and what is / isn't replicated
- Explain fixture management (seeding accounts, ledgers, transactions)
- Provide a working sample integration with `@stellar/stellar-sdk`
- Match the existing MDX frontmatter and writing style

## Sections

### Why Mock Horizon?
- Deterministic responses without network latency
- Offline development
- Reproducible CI test scenarios

### Endpoint Fidelity
- Which Horizon REST endpoints are covered
- Known omissions and workarounds

### Fixture Management
- Loading test accounts via friendbot equivalent
- Seeding transactions and ledger state
- Resetting state between test runs

### Working Sample
- Pointing the SDK at a local mock server
- Running a basic account fetch

## Acceptance Criteria

- Content builds with `pnpm build:content` without errors
- Internal links pass `pnpm check:links`
- Reviewed and approved by a maintainer before merge
