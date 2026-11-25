# Add Documentation Notes on Account Signers, Stellar Expert, Protocol Voting, and Ledger Checkpoints

## Summary

This PR adds four concise documentation working drafts to help developers understand key Stellar concepts:

- **Account Signer Types**: Overview of ed25519, preAuthTx, and sha256Hash signers with weight interaction mechanics
- **Stellar Expert Account and Asset Views**: Quick reference for accessing account and asset information on mainnet and testnet
- **Protocol Upgrade Voting**: How validators vote on protocol upgrades and the typical upgrade cadence
- **Ledger Checkpoint Cadence**: How frequently checkpoints are created and their role in historical data archival

All changes are scoped to documentation only. Working drafts are placed in the `/routes-d` folder at the repository root for maintainer review and approval before integration into the main documentation.

## Issues Addressed

Closes #824
Closes #827
Closes #830
Closes #831

## Changes

### New Files

1. **`routes-d/824-account-signer-types.mdx`**
   - Explains the three signer types supported on Stellar accounts
   - Documents ed25519 (standard keypair), preAuthTx (pre-authorized transaction hash), and sha256Hash (hash-based) signers
   - Describes signer weight interaction and how weights contribute to authorization thresholds
   - Includes practical code example using Stellar JavaScript SDK to query account signers
   - Provides links to related guides on accounts and multi-signature workflows

2. **`routes-d/827-stellar-expert-views.mdx`**
   - Lists Stellar Expert URLs for viewing accounts and assets
   - Provides clear examples for both mainnet and testnet URLs
   - Explains the testnet vs. mainnet distinction in URL paths
   - Shows how to use these tools for account inspection and transaction verification
   - Includes working examples with real account and asset identifiers

3. **`routes-d/830-protocol-upgrade-voting.mdx`**
   - Describes how Stellar protocol upgrades are voted on by validators
   - Explains the supermajority (67%+) voting mechanism
   - Notes the typical upgrade cadence (a few per year)
   - Points to Core Advancement Proposals (CAPs) and the Stellar Protocol Repository
   - Includes guidance on monitoring and preparing for upgrades

4. **`routes-d/831-ledger-checkpoint-cadence.mdx`**
   - States the checkpoint cadence (every 64 ledgers, approximately every 4-5 minutes)
   - Explains the contents of each checkpoint (ledger state, transaction history, results)
   - Describes the role of checkpoints in historical data archival and node catchup
   - Notes how Horizon and other services use checkpoints for data ingestion
   - Provides links to History Archive specifications and access points

## Requirements Met

✓ All changes scoped to documentation only
✓ Working drafts placed in `routes-d/` folder named after issue numbers
✓ MDX frontmatter and writing style match existing documentation
✓ Signer types, URLs, voting process, and checkpoint cadence clearly explained
✓ Links to related guides and official resources included
✓ Content is concise and scannable per issue requirements

## Verification

Before merge:

- [ ] Content builds with `pnpm build:content` without errors
- [ ] Internal links pass `pnpm check:links`
- [ ] Working drafts reviewed and approved by a maintainer
- [ ] All four issues mentioned in closure list

## Related Documentation

- [Stellar Horizon Integration](/docs/integrations/horizon) — Network API and queries
- [Glossary](/docs/guides/glossary) — Stellar and Nextellar terminology
- [Stellar Expert Official Site](https://stellar.expert) — Full explorer documentation
- [Stellar Protocol Repository](https://github.com/stellar/stellar-protocol) — CAPs and specifications
