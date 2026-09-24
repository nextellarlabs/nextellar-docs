#!/usr/bin/env node

/**
 * Contentlayer Build Profiler
 * Measures build time with detailed breakdown and stores results for analysis
 * Usage: node scripts/profile-contentlayer.js [runs=3] [--clear-cache]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const resultsFile = path.join(projectRoot, '.contentlayer-build-results.json');

const RUNS = parseInt(process.argv[2] || '3', 10);
const CACHE_CLEAR = process.argv.includes('--clear-cache');

/**
 * @typedef {Object} BuildResult
 * @property {number} run
 * @property {string} timestamp
 * @property {number} timeMs
 * @property {boolean} cacheCleared
 */

/**
 * @typedef {Object} Stats
 * @property {number} minMs
 * @property {number} maxMs
 * @property {number} avgMs
 * @property {number} medianMs
 */

function clearContentlayerCache() {
  const cacheDir = path.join(projectRoot, '.contentlayer');
  if (fs.existsSync(cacheDir)) {
    fs.rmSync(cacheDir, { recursive: true, force: true });
    console.log('✓ Contentlayer cache cleared');
  }
}

/**
 * @param {number} run
 * @param {boolean} clearCache
 * @returns {number}
 */
function runBuild(run, clearCache) {
  if (clearCache && run === 1) {
    clearContentlayerCache();
  }

  console.log(`\n[Run ${run}/${RUNS}] Building contentlayer...`);
  const startTime = Date.now();

  try {
    execSync('npm run build:content', {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash',
    });
    const timeMs = Date.now() - startTime;
    console.log(`✓ Build completed in ${timeMs}ms (${(timeMs / 1000).toFixed(2)}s)`);
    return timeMs;
  } catch (error) {
    console.error(`✗ Build failed`);
    process.exit(1);
  }
}

/**
 * @param {number[]} times
 * @returns {Stats}
 */
function calculateStats(times) {
  const sorted = [...times].sort((a, b) => a - b);
  return {
    minMs: Math.min(...times),
    maxMs: Math.max(...times),
    avgMs: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    medianMs: sorted[Math.floor(sorted.length / 2)],
  };
}

async function main() {
  const cacheStatus = CACHE_CLEAR ? 'YES' : 'NO';
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   Contentlayer Build Profiler                              ║
║   Runs: ${RUNS} | Cache Clear: ${cacheStatus}${cacheStatus === 'YES' ? '    ' : '     '}║
╚════════════════════════════════════════════════════════════╝
  `);

  /** @type {BuildResult[]} */
  const results = [];
  /** @type {number[]} */
  const times = [];

  for (let i = 1; i <= RUNS; i++) {
    const timeMs = runBuild(i, CACHE_CLEAR);
    times.push(timeMs);
    results.push({
      run: i,
      timestamp: new Date().toISOString(),
      timeMs,
      cacheCleared: CACHE_CLEAR && i === 1,
    });
  }

  const stats = calculateStats(times);

  const profileResults = {
    profileDate: new Date().toISOString(),
    nodeVersion: process.version,
    runsCompleted: RUNS,
    runs: results,
    stats,
  };

  // Save results to file
  fs.writeFileSync(resultsFile, JSON.stringify(profileResults, null, 2));

  // Print summary
  const minStr = (stats.minMs / 1000).toFixed(2);
  const maxStr = (stats.maxMs / 1000).toFixed(2);
  const avgStr = (stats.avgMs / 1000).toFixed(2);
  const medianStr = (stats.medianMs / 1000).toFixed(2);

  console.log(`
╔════════════════════════════════════════════════════════════╗
║   Profile Summary                                          ║
╠════════════════════════════════════════════════════════════╣
║ Minimum:     ${minStr}s${' '.repeat(Math.max(0, 42 - minStr.length))}║
║ Maximum:     ${maxStr}s${' '.repeat(Math.max(0, 42 - maxStr.length))}║
║ Average:     ${avgStr}s${' '.repeat(Math.max(0, 42 - avgStr.length))}║
║ Median:      ${medianStr}s${' '.repeat(Math.max(0, 42 - medianStr.length))}║
╚════════════════════════════════════════════════════════════╝
  `);

  console.log(`📊 Results saved to: ${resultsFile}`);
  console.log(JSON.stringify(profileResults, null, 2));

  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
