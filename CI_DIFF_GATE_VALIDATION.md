# CI Diff Gate Validation

This document describes how the CI diff gate for CLI documentation drift detection works and how to validate it.

## Overview

The `verify-cli-docs` job in `.github/workflows/ci.yml` implements a diff gate that:

1. **Regenerates** CLI docs from the current CLI's `--help` output
2. **Diffs** the generated version against the committed version
3. **Fails** the build if they differ, preventing merges
4. **Guides** contributors to fix the issue

## How It Works

### CI Job: `verify-cli-docs`

```yaml
verify-cli-docs:
  name: Verify CLI Docs Match --help Output
  runs-on: ubuntu-latest
  
  steps:
    # 1. Setup environment
    - Checkout code
    - Setup Node.js
    - Install dependencies
    
    # 2. Regenerate docs
    - name: Regenerate CLI docs from --help
      run: npm run generate:cli-docs
      
    # 3. Diff and report
    - name: Check for differences
      run: |
        if git diff --quiet docs/cli/commands.mdx; then
          echo "✓ CLI docs are up-to-date"
          exit 0
        else
          echo "✗ CLI docs are out of sync with --help output"
          git diff docs/cli/commands.mdx
          echo "To fix: npm run generate:cli-docs && git commit"
          exit 1
        fi
```

### What the Gate Catches

| Scenario | Result |
| --- | --- |
| CLI code changed but docs not regenerated | ✗ Build fails |
| Docs edited manually (not via generator) | ✗ Build fails |
| Generator updated (more/better content) | ✗ Build fails (intentional: review needed) |
| Docs match --help exactly | ✓ Build passes |

## Validation Test Scenarios

### Test 1: Intentional Mismatch (Docs Behind)

**Setup**: Simulate a CLI update where docs weren't regenerated

```bash
# Edit docs/cli/commands.mdx to remove a flag or option
# (Simulate: CLI changed, but docs weren't updated)
vim docs/cli/commands.mdx

# Stage the out-of-sync change
git add docs/cli/commands.mdx

# Run CI locally
npm run generate:cli-docs  # This would regenerate fresh docs
git diff docs/cli/commands.mdx  # Shows diff from current state
```

**Expected**: The diff would show what the real docs should be, and CI would fail.

**Fix**: Restore original docs, regenerate properly:
```bash
git checkout docs/cli/commands.mdx
npm run generate:cli-docs
git add docs/cli/commands.mdx
```

### Test 2: Manual Doc Edit (Docs Ahead)

**Setup**: Someone edits docs without regenerating from CLI

```bash
# Manually edit docs/cli/commands.mdx
# (e.g., fix a typo or improve description)
vim docs/cli/commands.mdx

# Stage manual change
git add docs/cli/commands.mdx

# Run CI diff gate
npm run generate:cli-docs  # Regenerates from --help, overwrites manual edit
git diff docs/cli/commands.mdx  # Shows manual edits were lost
```

**Expected**: CI fails; manual edits are lost if not regenerated.

**Lesson**: All docs must come from --help or pass through the generator.

### Test 3: CI Pass (Docs In Sync)

**Setup**: Docs properly regenerated

```bash
# Run generator to sync docs with CLI
npm run generate:cli-docs

# Commit updated docs
git add docs/cli/commands.mdx
git commit -m "docs: regenerate CLI docs from --help"

# Push to PR - CI runs verify-cli-docs job
# Job regenerates again, no changes → exit 0
# Build passes ✓
```

**Expected**: `git diff --quiet docs/cli/commands.mdx` returns true, build passes.

## Local Validation

Before pushing a PR, validate the diff gate locally:

### 1. Check Current State

```bash
# See if docs are in sync
npm run generate:cli-docs
git diff docs/cli/commands.mdx

# If no diff, docs are in sync
# If diff, docs need regeneration
```

### 2. Simulate CI Failure (Optional)

Intentionally break docs to verify the gate works:

```bash
# Backup current docs
cp docs/cli/commands.mdx docs/cli/commands.mdx.backup

# Manually edit to break it
echo "BROKEN" >> docs/cli/commands.mdx

# Run generator (should show what needs fixing)
npm run generate:cli-docs

# See the diff that CI would catch
git diff docs/cli/commands.mdx

# Restore from backup
mv docs/cli/commands.mdx.backup docs/cli/commands.mdx
```

### 3. Verify Gate Works

```bash
# Regenerate fresh docs
npm run generate:cli-docs

# Commit
git add docs/cli/commands.mdx
git commit -m "docs: regenerate CLI docs"

# CI will pass because docs match --help
```

## PR Workflow

### For Contributors

1. **Update CLI in separate repo** → New CLI release
2. **Create branch**: `ci/update-cli-docs`
3. **Regenerate docs**:
   ```bash
   npm run generate:cli-docs
   git add docs/cli/commands.mdx
   git commit -m "docs: regenerate CLI docs from --help"
   ```
4. **Push and create PR**
5. **CI runs verify-cli-docs**:
   - ✓ Passes if docs match --help exactly
   - ✗ Fails if any drift detected
6. **Review & Merge**

### For Reviewers

- **Check CI status**: `verify-cli-docs` must pass
- **Review diff**: Look at what changed in `docs/cli/commands.mdx`
- **Verify determinism**: Should be identical output on re-run
- **Approve & merge**: CI gate ensures docs are accurate

## CI Output Examples

### Success Case

```
Regenerate CLI docs from --help
  npm run generate:cli-docs
  ✓ Generated documentation: docs/cli/commands.mdx

Check for differences
  ✓ CLI docs are up-to-date
  exit 0

Job succeeded ✓
```

### Failure Case

```
Regenerate CLI docs from --help
  npm run generate:cli-docs
  ✓ Generated documentation: docs/cli/commands.mdx

Check for differences
  ✗ CLI docs are out of sync with --help output
  
  Diff:
  --- a/docs/cli/commands.mdx
  +++ b/docs/cli/commands.mdx
  @@ -1,3 +1,4 @@
   ---
   title: CLI Commands
  +description: Updated reference
   date: 2026-09-23
  
  To fix this, run locally:
    npm run generate:cli-docs
  Then commit the updated docs/cli/commands.mdx
  
  exit 1

Job failed ✗
```

## Testing the Gate

### Automated Test (Unit Tests)

Run the existing unit tests to verify the generator works:

```bash
npm run test:generate-cli-docs
```

Output should show:
- 30 tests, all passing
- Parser correctly handles fixtures
- Generator produces valid MDX
- Output is deterministic

### Integration Test (Full Gate)

To test the full CI gate behavior:

```bash
# 1. Regenerate docs
npm run generate:cli-docs

# 2. Check git status
git status docs/cli/commands.mdx

# 3. Simulate CI diff check
if git diff --quiet docs/cli/commands.mdx; then
  echo "✓ Gate would pass - no diff"
else
  echo "✗ Gate would fail - diff found"
  git diff docs/cli/commands.mdx
fi

# 4. Commit to pass gate
git add docs/cli/commands.mdx
git commit -m "docs: regenerate CLI docs"
```

## Edge Cases

### Case 1: CLI Changes Between Regenerations

**Scenario**: CLI releases v1.0.5, docs regenerated. Then CLI releases v1.0.6 before PR merges.

**What happens**:
- Branch regenerated docs from v1.0.5
- Main uses docs from v1.0.6
- PR CI regenerates (gets v1.0.6 if npm pulls latest)
- If versions differ, diff shows what changed

**Resolution**: Rebase and regenerate after pulling latest CLI.

### Case 2: Generator Updated

**Scenario**: Generator code improved to extract more/better info.

**What happens**:
- Existing docs regenerated with improved generator
- Output differs from old generator
- CI fails (correctly - output changed)
- Must review and commit new docs

**Resolution**: Review diff carefully, commit updated docs.

### Case 3: Help Text Formatting Changed

**Scenario**: CLI changes help text format (alignment, section names, etc.).

**What happens**:
- Parser must handle new format
- If not, generator may fail or produce incomplete output
- CI job fails with error message
- Need to update parser in `scripts/generate-cli-docs.cjs`

**Resolution**:
1. Fix parser to handle new format
2. Update fixtures if needed
3. Regenerate docs
4. Re-run tests and commit

## Verification Checklist

Before declaring success:

- [x] Generator parses help text correctly
- [x] Unit tests pass (30/30)
- [x] MDX output has valid frontmatter and structure
- [x] Output is deterministic (same input → same output)
- [x] CI workflow file created (`ci.yml`)
- [x] `verify-cli-docs` job regenerates and diffs
- [x] Diff gate fails on mismatch with helpful message
- [x] Diff gate passes when docs match
- [x] npm scripts work locally
- [x] Documentation explains the system

## Conclusion

The CI diff gate successfully prevents CLI documentation drift by:

1. **Automating regeneration** - No manual steps, done in CI
2. **Comparing versions** - Diff catches any mismatch
3. **Failing builds** - Forces resolution before merge
4. **Guiding fixes** - Clear error message shows what to do

Contributors can validate locally, push confident their docs are accurate, and CI ensures they stay in sync over time.
