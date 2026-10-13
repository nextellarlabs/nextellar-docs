#!/usr/bin/env node

/**
 * Contentlayer Build Budget Checker
 * Enforces a time budget for contentlayer builds in CI pipelines
 * Fails with exit code 1 if build time exceeds budget, with clear messaging
 * 
 * Usage:
 *   node scripts/check-build-budget.js <build_time_ms> [--budget=<ms>] [--label=<name>]
 *   
 * Examples:
 *   node scripts/check-build-budget.js 5000                    # Check 5000ms against default budget
 *   node scripts/check-build-budget.js 5000 --budget=6500      # Check 5000ms against custom budget
 *   node scripts/check-build-budget.js 5000 --label="Prod"     # Check with custom label
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// DEFAULT BUILD BUDGET: 6.5 seconds (6500ms)
// Rationale: This is 30% above a conservative 5s optimization target,
// accounting for CI machine variance and allowing headroom for minor
// content growth without triggering false positives.
// Adjust by passing --budget=<ms> or by editing BUILD_BUDGET_MS below.
const BUILD_BUDGET_MS = 6500;

/**
 * Parse command line arguments
 * @returns {{ buildTimeMs: number; budgetMs: number; label: string }}
 */
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node scripts/check-build-budget.js <build_time_ms> [--budget=<ms>] [--label=<name>]');
    process.exit(1);
  }

  const buildTimeMs = parseInt(args[0], 10);
  if (isNaN(buildTimeMs) || buildTimeMs < 0) {
    console.error(`Error: Invalid build time '${args[0]}'. Must be a non-negative number (milliseconds).`);
    process.exit(1);
  }

  let budgetMs = BUILD_BUDGET_MS;
  let label = 'Contentlayer Build';

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--budget=')) {
      budgetMs = parseInt(arg.split('=')[1], 10);
      if (isNaN(budgetMs) || budgetMs <= 0) {
        console.error(`Error: Invalid budget '${arg}'. Must be a positive number (milliseconds).`);
        process.exit(1);
      }
    } else if (arg.startsWith('--label=')) {
      label = arg.split('=')[1];
    }
  }

  return { buildTimeMs, budgetMs, label };
}

/**
 * Format milliseconds to a human-readable string
 * @param {number} ms
 * @returns {string}
 */
function formatTime(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Format a percentage with consistent precision
 * @param {number} value
 * @returns {string}
 */
function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

/**
 * Main budget check function
 */
function main() {
  const { buildTimeMs, budgetMs, label } = parseArgs();
  const exceeded = buildTimeMs > budgetMs;
  const percentOfBudget = (buildTimeMs / budgetMs) * 100;
  const diff = buildTimeMs - budgetMs;

  // Format output with consistent spacing
  const icon = exceeded ? '❌' : '✅';
  const status = exceeded ? 'FAILED' : 'PASSED';
  const buildTimeStr = formatTime(buildTimeMs);
  const budgetStr = formatTime(budgetMs);
  const percentStr = formatPercent(percentOfBudget);

  console.log(`
╔════════════════════════════════════════════════════════════╗
║   Build Budget Check                                       ║
╠════════════════════════════════════════════════════════════╣
║ Label:        ${label.padEnd(47)}║
║ Build Time:   ${buildTimeStr.padEnd(47)}║
║ Budget:       ${budgetStr.padEnd(47)}║
║ Status:       ${status.padEnd(47)}║
║ Usage:        ${percentStr.padEnd(47)}║
╚════════════════════════════════════════════════════════════╝
  `);

  if (exceeded) {
    const diffStr = formatTime(Math.abs(diff));
    console.error(`
${icon} Build time EXCEEDS budget by ${diffStr} (${percentStr} of budget)

ACTION REQUIRED:
  1. Check for unintended slowdowns in the build pipeline
  2. Review recent changes to Contentlayer config or content
  3. Validate cache is being preserved between builds
  4. If slowdown is expected due to content growth, update budget in:
     - scripts/check-build-budget.js (BUILD_BUDGET_MS constant)
     - .github/workflows/build.yml (--budget parameter)

CURRENT SETTINGS:
  - Build Budget: ${budgetStr}
  - Measurement: ${buildTimeStr}
  `);
    process.exit(1);
  } else {
    const remainingMs = budgetMs - buildTimeMs;
    const remainingStr = formatTime(remainingMs);
    console.log(`
${icon} Build time is within budget with ${remainingStr} headroom

Build pipeline is healthy. Current performance metrics:
  - Build Time:  ${buildTimeStr}
  - Headroom:    ${remainingStr}
  - Safe Margin: ${formatPercent(100 - percentOfBudget)}
    `);
    process.exit(0);
  }
}

main();
