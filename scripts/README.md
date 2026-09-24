# Build Scripts

This directory contains scripts for profiling and validating Contentlayer build performance.

## Scripts Overview

### profile-contentlayer.js
**Purpose:** Measure Contentlayer build times to establish baselines and track performance changes.

**Usage:**
```bash
# Profile with 3 runs, clearing cache before first run
node scripts/profile-contentlayer.js 3 --clear-cache

# Profile with 5 warm runs (cache preserved)
node scripts/profile-contentlayer.js 5

# Profile with custom number of runs
node scripts/profile-contentlayer.js 10
```

**Output:**
- Console summary with min/max/avg/median times
- JSON results file: `.contentlayer-build-results.json`

**When to use:**
- Establishing baseline before optimization
- Measuring impact after code changes
- Tracking build time trends over time

**Example workflow:**
```bash
# Before optimization
node scripts/profile-contentlayer.js 3 --clear-cache
# Save results as baseline-before.json

# Make optimization changes

# After optimization
node scripts/profile-contentlayer.js 3 --clear-cache
# Compare results with baseline

# Calculate improvement percentage
```

---

### check-build-budget.js
**Purpose:** Validate build time against a configured budget; used in CI pipelines.

**Usage:**
```bash
# Check build time against default 6500ms budget
node scripts/check-build-budget.js 5234

# Use custom budget
node scripts/check-build-budget.js 5234 --budget=7000

# Add custom label to output
node scripts/check-build-budget.js 5234 --label="Production Build"

# Combine options
node scripts/check-build-budget.js 5234 --budget=6000 --label="CI Build"
```

**Exit Codes:**
- `0`: Build time within budget ✅
- `1`: Build time exceeds budget ❌

**Output:**
Formatted table showing:
- Build time vs. budget
- Usage percentage
- Headroom remaining
- Status (PASSED/FAILED)
- Actionable recommendations if failed

**Integration in CI:**
```bash
# Measure build time and check budget
START=$(date +%s%N)
npm run build:content
END=$(date +%s%N)
DURATION_MS=$(( (END - START) / 1000000 ))

# Check against budget
node scripts/check-build-budget.js $DURATION_MS --budget=6500
```

**When to use:**
- Preventing build time regressions in CI
- Validating performance after changes
- Pre-commit/pre-push checks (locally)

---

## Best Practices

### Profiling for Optimization
1. **Establish baseline:** 3 runs with cache clear
2. **Make change:** Single targeted optimization
3. **Measure impact:** 3 warm runs (preserve cache)
4. **Compare:** Use avg/median, ignore outliers
5. **Document:** Record before/after in PR

### Managing the Budget
- **Default budget:** 6,500ms (see check-build-budget.js line ~26)
- **Adjust in script:** Edit `BUILD_BUDGET_MS` constant
- **Adjust in CI:** Edit `--budget=` parameter in `.github/workflows/build-budget.yml`
- **Document reason:** Update PR when changing budget

### CI Integration
The `.github/workflows/build-budget.yml` workflow:
- Runs on PRs modifying contentlayer config or docs
- Measures build time using system timestamps
- Calls `check-build-budget.js` with measured time
- Posts metrics to PR comments
- Fails workflow if budget exceeded

---

## Troubleshooting

### "Build failed" error
If `profile-contentlayer.js` shows build failures:
1. Ensure dependencies are installed: `npm install`
2. Check for syntax errors in contentlayer.config.ts
3. Verify docs directory has valid MDX files
4. Run `npm run build:content` manually to see detailed error

### Budget check script not found
```bash
# Verify script exists and has execute permissions
ls -la scripts/check-build-budget.js

# Run with explicit node
node scripts/check-build-budget.js 5000
```

### CI workflow not triggering
Check `.github/workflows/build-budget.yml` path filters:
- Workflow triggers on changes to `contentlayer.config.ts`, `docs/**`, `versions/**`
- Verify your changes match these paths
- Workflow should appear in "Actions" tab on PR

---

## Performance Monitoring

### Tracking Over Time
Set up a simple log to track build times:
```bash
# Add to your profiling workflow
node scripts/profile-contentlayer.js 3 --clear-cache >> build-times.log

# View historical data
cat build-times.log | grep '"avgMs"'
```

### Regression Detection
If you notice builds consistently above 90% of budget:
1. Run profiler: `node scripts/profile-contentlayer.js 5`
2. Check recent commits for changes
3. Profile before/after each recent change
4. Identify which change caused slowdown
5. Either optimize that change or increase budget if intended

---

## Future Enhancements

Possible improvements to these scripts:
- [ ] Export timing data to JSON for graphing
- [ ] Compare before/after across runs
- [ ] Alert on regression threshold
- [ ] Integrate with GitHub Checks API
- [ ] Support for parallel build timing
- [ ] Historical trend tracking in CI

---

## References
- Issue: #1203
- Documentation: `CONTENTLAYER_OPTIMIZATION.md`
- Workflow: `.github/workflows/build-budget.yml`
