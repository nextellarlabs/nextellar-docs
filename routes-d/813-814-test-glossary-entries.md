# Test Documentation for Glossary Entries (Issues #813, #814)

## Overview
This document outlines the testing approach for verifying new glossary entries related to Stellar Development Foundation (SDF) and XDR types.

## Test Objectives

### Issue #813: SDF Glossary Entry
Verify that a glossary entry for "SDF" (Stellar Development Foundation) has been added with:
- Clear definition of the acronym
- Role in the Stellar ecosystem
- Reference context in related documentation

**Test Cases:**
1. Glossary contains `### SDF` header
2. SDF entry includes definition of "Stellar Development Foundation"
3. SDF entry explains its role in Stellar network governance/development
4. Entry is concise and scannable
5. Related cross-references are included if applicable

### Issue #814: Envelope XDR and Result XDR Glossary Entries
Verify that glossary entries for both XDR types have been added:

**Envelope XDR:**
- Concise definition explaining its role in transaction structure
- Reference to transaction envelope types and submission flow

**Result XDR:**
- Definition explaining what result XDR contains (operation results, metadata)
- Context on when/where it appears in transaction lifecycle

**Test Cases:**
1. Glossary contains `### Envelope XDR` header
2. Glossary contains `### Result XDR` header
3. Both entries are located in the "Common Terms" section
4. Each entry has 1-3 sentences as per glossary style guide
5. Neither entry is duplicated
6. Fencing and formatting are consistent with existing entries

## Glossary Style Requirements
All new entries must follow this pattern:

```
### Term Name

Brief definition in 1-3 sentences. Keep it scannable and reference other glossary terms only as needed.
```

## Verification Steps

1. **Structural Validation**
   - Check glossary.mdx file structure
   - Confirm headers use `###` format
   - Verify alphabetical ordering if maintained
   - Ensure consistent trailing/leading blank lines

2. **Content Validation**
   - Verify definitions are accurate and concise
   - Check that acronyms are properly expanded on first mention
   - Confirm related concepts are cross-referenced

3. **Build Validation**
   - Run `pnpm build:content` to ensure MDX compiles
   - Run `pnpm check:links` to verify internal link integrity
   - Visually inspect glossary page rendering

4. **Integration Validation**
   - Verify entries appear correctly on `/docs/guides/glossary` page
   - Check that glossary entries are searchable via search indexing
   - Confirm no duplicate entries exist elsewhere

## Related Issues
- #813 - Add glossary entry for SDF
- #814 - Add glossary entries for Envelope XDR and Result XDR
- Tests: `tests/docs-accuracy-813-814-648-623.spec.ts`

## Implementation Notes
- Glossary file: `docs/guides/glossary.mdx`
- Entries should maintain existing alphabetical ordering (SDF, then Envelope XDR, then Result XDR)
- Keep definitions under 100 words per entry
- Use present tense and passive voice for consistency
