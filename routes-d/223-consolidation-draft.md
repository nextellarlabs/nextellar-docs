# Issue 223: Consolidate duplicate content across overlapping pages

## Summary

This document outlines the content consolidation strategy for reducing duplicate content across the documentation.

## Identified Overlapping Content

### 1. Testing Documentation

- **guides/testing.mdx** - Vitest/jsdom setup for unit testing
- **integrations/testing.mdx** - Mock Service Worker (MSW) for API mocking

**Action**: These are complementary topics. The guides/testing.mdx covers unit testing infrastructure, while integrations/testing.mdx covers API mocking. They should remain separate but be cross-linked in the sidebar.

**Changes**:

- Updated sidebar to place guides/testing as "Testing (Vitest)"
- Updated sidebar to place integrations/testing as "Testing (MSW)"
- Both pages should add cross-references to each other

### 2. Getting Started and Examples

- **docs/getting-started/quick-start.mdx** - Quick start guide
- **docs/examples/payment-app.mdx** - Payment app example

**Action**: These are complementary. Quick start is conceptual guidance, examples are working code. No consolidation needed, but should be cross-linked.

### 3. Guides Index and Examples Index

- **docs/guides/index.mdx** - Landing page with links to guides
- **docs/examples/index.mdx** - Landing page with example code and snippets

**Action**: Both are landing pages serving different purposes. Guides index links to deployment, contributing, etc. Examples index shows quick snippets. These are distinct and should remain separate.

### 4. Hook Documentation Structure

- **docs/sdk/overview.mdx** - Overview mentions all 8 hooks with table
- **docs/hooks/** - Individual hook documentation pages
- **docs/examples/index.mdx** - Contains usage examples for hooks

**Action**: This is a proper hierarchy - overview → individual docs → examples. No consolidation needed.

## Consolidation Actions Completed

1. **Updated sidebar.tsx**:
   - Removed duplicate "Hooks" link from "SDK & Reference" section
   - Renamed "SDK & Reference" to "SDK Documentation"
   - Reorganized section order for better navigation flow
   - Added "Wallet Integration" to SDK Documentation
   - Added "CLI Overview" to CLI section
   - Clarified testing links with "(Vitest)" and "(MSW)" labels

## Cross-linking Improvements

The following pages should add cross-references to related content:

1. **docs/guides/testing.mdx**: Add link to integrations/testing for MSW
2. **docs/integrations/testing.mdx**: Add link to guides/testing for Vitest setup
3. **docs/examples/index.mdx**: Add link to guides for more advanced topics
4. **docs/guides/index.mdx**: Add link to examples for code samples

## Verification Steps

- Run `pnpm build:content` to verify no build errors
- Run `pnpm check:links` to verify all links are valid
- Manual review of sidebar navigation for logical flow
- Verify no pages are orphaned or unreachable

## Files Modified

- `config/sidebar.tsx` - Reorganized information architecture
