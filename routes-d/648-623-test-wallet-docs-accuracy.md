# Test Documentation for Wallet Documentation Accuracy (Issues #648, #623)

## Overview
This document outlines testing procedures to ensure wallet integration documentation accurately reflects the implemented wallet-kit configuration and WalletProvider component.

## Issue #648: Verify wallets.mdx Against wallet-kit Configuration

### Context
The `docs/integrations/wallets.mdx` file should accurately document the wallet adapters that are actually wired into `@creit.tech/stellar-wallets-kit` as used in the Nextellar scaffold template.

### Source of Truth
- **Configuration File:** `src/templates/default/src/lib/stellar-wallet-kit.ts`
- **Kit Modules:** The file imports and instantiates wallet modules
- **Scaffolding:** `--wallets` CLI flag maps to these modules

### Test Objectives

**Adapter Verification:**
1. Verify exactly five wallet adapters are documented as supported:
   - Freighter
   - Albedo
   - Lobstr
   - xBull
   - Hana

2. Ensure unsupported adapters are NOT listed as available:
   - Ledger (not wired in kit)
   - Rabet (not wired in kit)
   - WalletConnect (not standard kit adapter)

3. Verify adapter module names match kit imports:
   - FreighterModule
   - AlbedoModule
   - LobstrModule
   - xBullModule
   - HanaModule

**Flag-to-Config Flow:**
1. Document how `--wallets` CLI flag maps to kit modules
2. Show default wallet list (freighter, albedo, lobstr)
3. Explain what happens with unsupported adapter names

**Code Example Validation:**
1. Code fence count must be even (paired opening/closing fences)
2. All code examples must use correct module names
3. Network configuration example must show proper WalletNetwork values

### Test Cases
- [ ] Adapter table lists only five wallets
- [ ] All five real adapters have feature descriptions
- [ ] Code examples use correct module class names
- [ ] `--wallets` flag documentation is present and accurate
- [ ] Default wallet configuration is documented
- [ ] No unsupported adapters are listed as available
- [ ] Fence count is even (no mismatched code blocks)
- [ ] All code snippets are syntactically valid TypeScript
- [ ] Related CLI docs are linked correctly

## Issue #623: Verify wallet-provider.mdx Against Source

### Context
The `docs/hooks/wallet-provider.mdx` file documents the WalletProvider context. It must remain in sync with the actual `src/templates/default/src/contexts/WalletProvider.tsx` component.

### Source of Truth
- **Provider Source:** `src/templates/default/src/contexts/WalletProvider.tsx`
- **Config Mapping:** `src/lib/scaffold.ts:177-217` (placeholder substitutions)
- **Known Issues:** Duplicate key bugs (like duplicate sorobanUrl in CLI issue #108)

### Test Objectives

**Provider Props Verification:**
1. Document all actual props the WalletProvider accepts
2. Verify each documented prop exists in source
3. Ensure no documented props have been removed

**Context Values Verification:**
1. Document all context values exposed by useWallet() hook
2. Verify each context value exists in source
3. Check that return types are accurate

**Config Keys Verification:**
1. Document configuration keys passed to WalletProvider
2. Verify scaffold-time placeholders are explained:
   - {{HORIZON_URL}}
   - {{SOROBAN_URL}}
   - {{WALLETS}}
3. Ensure config key names match source exactly (avoid duplicate keys)

**Flag-to-Provider Flow:**
1. Explain how scaffold flags flow into provider config
2. Document default values for each config key
3. Show how --wallets flag determines available adapters

**Documentation Quality:**
1. Code fence count must be even
2. All examples must compile/be valid TypeScript
3. JSX examples must be properly formatted

### Test Cases
- [ ] All documented provider props exist in source file
- [ ] All documented context values exist in source file
- [ ] No duplicate configuration keys are documented
- [ ] Placeholder substitutions ({{HORIZON_URL}}, etc.) are explained
- [ ] Default values match scaffold.ts configuration
- [ ] Fence count is even (no mismatched code blocks)
- [ ] All code examples are valid TypeScript/TSX
- [ ] No props/context are marked as deprecated without explanation
- [ ] Related hook documentation is linked correctly
- [ ] Cross-references to WalletConnectButton component are accurate

## Shared Test Procedures

### Build Validation
```bash
# Ensure content builds successfully
pnpm build:content
```

### Link Validation
```bash
# Check all internal links
pnpm check:links

# Check anchors only
pnpm check:anchors
```

### Rendering Validation
1. Build the docs with `pnpm build`
2. Visually inspect the rendered pages:
   - `/docs/integrations/wallets`
   - `/docs/hooks/wallet-provider`
3. Verify code blocks render with syntax highlighting
4. Confirm all links are clickable and working

### Code Example Validation
1. All TypeScript code blocks must be valid syntax
2. All JSX examples should follow component usage patterns
3. Import statements should reference actual exported members

## Automated Test File
See `tests/docs-accuracy-813-814-648-623.spec.ts` for automated verification of:
- Glossary entries presence and structure
- Wallet documentation accuracy
- Cross-documentation consistency

## Related Issues
- #648 - Verify integrations/wallets.mdx against wallet-kit configuration
- #623 - Verify wallet-provider.mdx against WalletProvider source
- #813 - Add glossary entry for SDF
- #814 - Add glossary entries for Envelope XDR and Result XDR

## Verification Checklist

### Pre-Implementation
- [ ] Reviewed source files (stellar-wallet-kit.ts, WalletProvider.tsx, scaffold.ts)
- [ ] Identified all supported adapters
- [ ] Identified all configuration options
- [ ] Noted all scaffold-time placeholder substitutions

### Documentation Update
- [ ] Updated wallets.mdx with accurate adapter list
- [ ] Updated wallet-provider.mdx with accurate props/context
- [ ] Added flag-to-config flow documentation
- [ ] Verified all code examples compile

### Post-Implementation Validation
- [ ] All tests in docs-accuracy suite pass
- [ ] `pnpm build:content` succeeds
- [ ] `pnpm check:links` succeeds
- [ ] Manual visual inspection confirms rendering
- [ ] No duplicate keys or mismatched fence counts

