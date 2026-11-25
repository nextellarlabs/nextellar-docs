# PR Description: Stellar Operations & SEP Protocol Documentation

## Summary

This PR adds comprehensive documentation for four key Stellar operations and SEP protocol flows:

1. **#849** - Guide on `create_passive_sell_offer` operation
2. **#847** - Guide on `create_account` operation
3. **#845** - Guide on SEP-6 deposit and withdraw flow
4. **#843** - Guide on SEP-29 memo required implementation

All guides follow the existing Nextellar documentation style and include practical examples, use cases, and common pitfalls.

## Changes

### New Documentation Files (in `/routes-d/`)

- `849-create-passive-sell-offer.mdx` - Comprehensive guide to passive offer operations
- `847-create-account.mdx` - Account creation with funding requirements and error handling
- `845-sep6-deposit-withdraw.mdx` - SEP-6 flow with request shapes and KYC integration points
- `843-sep29-memo-required.mdx` - SEP-29 memo required implementation on client

### Documentation Details

Each guide includes:
- Clear use case explanations
- Working code examples using the Stellar SDK
- Common errors and how to handle them
- Management flows (creation, modification, cancellation where applicable)
- Integration points with other protocols (SEP-12 KYC, SEP-10 auth, etc.)

## Testing

- All guides follow existing MDX frontmatter conventions
- Verified examples are accurate for Stellar mainnet and testnet
- Code snippets follow Nextellar SDK patterns
- Documentation is visually verified in browser

## Closes

- closes #849
- closes #847
- closes #845
- closes #843
