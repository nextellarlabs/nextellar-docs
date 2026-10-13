import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const budgetPath = path.join(root, 'config', 'performance-budget.json');
const buildDir = path.join(root, '.next', 'static');

const budget = JSON.parse(await fs.readFile(budgetPath, 'utf8'));

const warnings = [];
const failures = [];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (/\.(?:js|css)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

try {
  const files = await walk(buildDir);
  const totals = { js: 0, css: 0, total: 0 };

  for (const file of files) {
    const stat = await fs.stat(file);
    const size = stat.size;
    totals.total += size;
    if (file.endsWith('.js')) totals.js += size;
    if (file.endsWith('.css')) totals.css += size;
  }

  const metrics = [
    {
      label: 'JS bundle',
      value: totals.js,
      limit: budget.jsBytes,
      warn: budget.warnJsBytes,
      unit: 'B',
      key: 'js',
    },
    {
      label: 'CSS bundle',
      value: totals.css,
      limit: budget.cssBytes,
      warn: budget.warnCssBytes,
      unit: 'B',
      key: 'css',
    },
    {
      label: 'Total static assets',
      value: totals.total,
      limit: budget.totalBytes,
      warn: budget.warnTotalBytes,
      unit: 'B',
      key: 'total',
    },
  ];

  console.log('Performance budget report');
  console.log('========================');

  for (const metric of metrics) {
    const valueMB = (metric.value / 1024 / 1024).toFixed(2);
    const limitMB = (metric.limit / 1024 / 1024).toFixed(2);
    const warnMB = (metric.warn / 1024 / 1024).toFixed(2);

    console.log(`${metric.label}: ${valueMB} MB (limit ${limitMB} MB, warn ${warnMB} MB)`);

    if (metric.value > metric.limit) {
      failures.push(`${metric.label} ${valueMB} MB exceeds ${limitMB} MB hard limit`);
    } else if (metric.value > metric.warn) {
      warnings.push(`${metric.label} ${valueMB} MB exceeds ${warnMB} MB warning threshold`);
    }
  }

  if (warnings.length > 0) {
    console.log('\nWarnings:');
    for (const warning of warnings) console.log(`- ${warning}`);
  }

  if (failures.length > 0) {
    console.log('\nBudget failures:');
    for (const failure of failures) console.log(`- ${failure}`);
    process.exit(1);
  }

  console.log('\n✅ Performance budget passed.');
} catch (error) {
  console.error('Performance budget check failed. Run "pnpm run build" before checking budgets.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
