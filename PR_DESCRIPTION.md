# docs: remove unavailable component links from sidebar

## 🎯 Objective
Remove broken component links from the sidebar that point to non-existent documentation files, achieving 100% link validity in the Components section.

## 📊 Changes Summary

### Before Cleanup
- **Total links:** 5
- **Valid links:** 2 (40%)
- **Broken links:** 3 (60%)
- **Link validity:** 40% ❌

### After Cleanup
- **Total links:** 2
- **Valid links:** 2 (100%)
- **Broken links:** 0 (0%)
- **Link validity:** 100% ✅

## 🔧 Changes Made

### 1. Removed Broken Links (3 total)
The following component links were removed from `config/sidebar.tsx` because their corresponding documentation files do not exist:

- ❌ **BalanceCard** (`/docs/components/balance-card`)
  - Missing: `docs/components/balance-card.mdx`
- ❌ **PaymentForm** (`/docs/components/payment-form`)
  - Missing: `docs/components/payment-form.mdx`
- ❌ **TransactionList** (`/docs/components/transaction-list`)
  - Missing: `docs/components/transaction-list.mdx`

### 2. Kept Valid Links (2 total)
- ✅ **ConnectWalletButton** → `docs/components/connect-wallet-button.mdx`
- ✅ **useWindowSize** → `docs/components/use-window-size.mdx`

### 3. Added Validation Infrastructure
Created automated validation scripts to prevent future regressions:

- **`scripts/validate-sidebar.cjs`** - Validates sidebar links against filesystem
- **`scripts/check-links.cjs`** - Runtime link validation (requires dev server)
- **`scripts/final-validation.cjs`** - Comprehensive acceptance criteria check
- **`sidebar-validation.json`** - Machine-readable validation data

### 4. Updated Configuration
- **`config/sidebar.tsx`** - Added documentation header explaining cleanup
- **`package.json`** - Added `validate:sidebar` and `check:links` scripts

## 🧪 Validation Performed

### Filesystem Validation
```bash
$ pnpm validate:sidebar
🔍 COMPONENTS INVENTORY (SOURCE OF TRUTH)
VALID (18): button, checkbox, connect-wallet-button, dialog, folder-tree, 
input, label, menu, nav-menu, note, popover, search-button, select, 
sidebar, steps, syntax-highlighter, tabs, use-window-size

📋 SIDEBAR CLAIMS
CLAIMS (2): connect-wallet-button, use-window-size

❌ BROKEN LINKS TO REMOVE (0):

✅ VALID LINKS TO KEEP (2):
  - connect-wallet-button
  - use-window-size

✅ SUMMARY
Keep: 2/2 (100%)
Remove: 0/2 (0%)
Post-cleanup: 2/18 available components in sidebar
```

### Acceptance Criteria
✅ All sidebar links point to existing files (2/2 valid)  
✅ No broken links remain (0 broken)  
✅ Components section not empty (2 items)  
✅ Sidebar structure preserved (type, title, icon maintained)  
✅ Validation scripts created (3 scripts + 1 data file)  
✅ Documentation added (header comment in sidebar.tsx)

## 📁 Files Changed

### Modified
- `config/sidebar.tsx` - Removed 3 broken entries, added documentation
- `package.json` - Added validation scripts

### Created
- `scripts/validate-sidebar.cjs` - Sidebar validation script
- `scripts/check-links.cjs` - Runtime link checker
- `scripts/final-validation.cjs` - Final validation script
- `sidebar-validation.json` - Validation data
- `CLEANUP_REPORT.md` - Detailed cleanup report
- `PR_DESCRIPTION.md` - This file

## 🚀 Testing Instructions

### 1. Validate Sidebar Links
```bash
pnpm validate:sidebar
```
Expected: Shows 2/2 valid links (100%)

### 2. Test Runtime Links (Optional)
```bash
# Terminal 1
pnpm dev

# Terminal 2
pnpm check:links
```
Expected: All links return 200 status

### 3. Verify Sidebar Structure
```bash
pnpm dev
```
Navigate to the docs and verify:
- Components section appears in sidebar
- Both links (ConnectWalletButton, useWindowSize) work
- No 404 errors

## 🔮 Future-Proofing

Before adding new component links to the sidebar, run:
```bash
pnpm validate:sidebar
```

This will:
- List all available component files
- Show current sidebar claims
- Identify any broken links

## 📝 Notes

- Preserved exact Nextra sidebar structure and syntax
- Maintained title casing and visual hierarchy
- No changes to other sidebar sections
- TypeScript compilation verified (no diagnostics)

## 🔗 Related

Closes #127

---

**Impact:** Eliminates 404 errors in Components section, improves user experience, adds automated validation to prevent future regressions.
