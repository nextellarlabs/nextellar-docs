#!/usr/bin/env node

/**
 * Hooks Documentation Verification Script
 * 
 * Verifies that documented hook signatures in docs/hooks/api-reference.mdx
 * match the expected schema in scripts/hooks-schema.json.
 * 
 * Usage:
 *   node scripts/verify-hooks-docs.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, 'hooks-schema.json');
const apiRefPath = path.join(__dirname, '..', 'docs', 'hooks', 'api-reference.mdx');

// ============================================================================
// LOAD SCHEMA
// ============================================================================

function loadSchema() {
  try {
    const content = fs.readFileSync(schemaPath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Failed to load schema: ${err.message}`);
    process.exit(1);
  }
}

// ============================================================================
// PARSE API REFERENCE MDX
// ============================================================================

function parseApiReference(content) {
  const hooks = [];
  const lines = content.split('\n');
  let currentHook = null;
  let inSignature = false;
  let inParams = false;
  let inReturns = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect hook section header (e.g., "## 1. `useStellarWallet`")
    const hookMatch = line.match(/^##\s+\d+\.\s+`([a-zA-Z0-9_]+)`/);
    if (hookMatch) {
      if (currentHook) {
        hooks.push(currentHook);
      }
      currentHook = {
        name: hookMatch[1],
        signature: null,
        requiredParams: [],
        optionalParams: [],
        requiredReturns: []
      };
      inSignature = false;
      inParams = false;
      inReturns = false;
      continue;
    }

    if (!currentHook) continue;

    // Detect signature section
    if (line.trim() === '### Signature') {
      inSignature = true;
      inParams = false;
      inReturns = false;
      continue;
    }

    // Extract signature
    if (inSignature && line.trim().startsWith('```typescript')) {
      const nextLine = lines[i + 1];
      if (nextLine && nextLine.trim().startsWith('function')) {
        currentHook.signature = nextLine.trim();
      }
      inSignature = false;
      continue;
    }

    // Detect parameters section
    if (line.trim() === '### Parameters') {
      inParams = true;
      inReturns = false;
      continue;
    }

    // Detect return values section
    if (line.trim() === '### Return Values') {
      inParams = false;
      inReturns = true;
      continue;
    }

    // Parse parameter table
    if (inParams && line.startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 2 && cells[0] !== 'Parameter') {
        const paramName = cells[0];
        const typeInfo = cells[1];
        
        // Check if parameter is required (no default specified)
        const isRequired = typeInfo.includes('Required') || 
                          (currentHook.signature && 
                           currentHook.signature.includes(`${paramName}:`) &&
                           !currentHook.signature.includes(`${paramName}?`));
        
        if (isRequired) {
          currentHook.requiredParams.push(paramName);
        } else {
          currentHook.optionalParams.push(paramName);
        }
      }
    }

    // Parse return values table
    if (inReturns && line.startsWith('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 2 && cells[0] !== 'Property') {
        const returnProp = cells[0];
        currentHook.requiredReturns.push(returnProp);
      }
    }
  }

  if (currentHook) {
    hooks.push(currentHook);
  }

  return hooks;
}

// ============================================================================
// VALIDATE AGAINST SCHEMA
// ============================================================================

function validateAgainstSchema(docHooks, schemaHooks) {
  const issues = [];

  // Check all schema hooks are documented
  for (const schemaHook of schemaHooks.hooks) {
    const docHook = docHooks.find(h => h.name === schemaHook.name);
    
    if (!docHook) {
      issues.push({
        type: 'missing-hook',
        hook: schemaHook.name,
        message: `Hook ${schemaHook.name} is missing from documentation`
      });
      continue;
    }

    // Compare signatures
    if (docHook.signature !== schemaHook.signature) {
      issues.push({
        type: 'signature-drift',
        hook: schemaHook.name,
        expected: schemaHook.signature,
        actual: docHook.signature,
        message: `Signature drift for ${schemaHook.name}`
      });
    }

    // Compare required parameters
    const missingParams = schemaHook.requiredParams.filter(
      p => !docHook.requiredParams.includes(p)
    );
    if (missingParams.length > 0) {
      issues.push({
        type: 'missing-required-params',
        hook: schemaHook.name,
        missing: missingParams,
        message: `Missing required parameters in ${schemaHook.name}: ${missingParams.join(', ')}`
      });
    }

    // Compare required returns
    const missingReturns = schemaHook.requiredReturns.filter(
      r => !docHook.requiredReturns.includes(r)
    );
    if (missingReturns.length > 0) {
      issues.push({
        type: 'missing-required-returns',
        hook: schemaHook.name,
        missing: missingReturns,
        message: `Missing required return properties in ${schemaHook.name}: ${missingReturns.join(', ')}`
      });
    }
  }

  // Check for undocumented hooks
  for (const docHook of docHooks) {
    const schemaHook = schemaHooks.hooks.find(h => h.name === docHook.name);
    if (!schemaHook) {
      issues.push({
        type: 'undocumented-hook',
        hook: docHook.name,
        message: `Hook ${docHook.name} is documented but not in schema`
      });
    }
  }

  return issues;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🔍 Hooks Documentation Verification\n');

  // Load schema
  const schema = loadSchema();
  console.log(`✓ Loaded schema with ${schema.hooks.length} hooks\n`);

  // Parse API reference
  const apiRefContent = fs.readFileSync(apiRefPath, 'utf-8');
  const docHooks = parseApiReference(apiRefContent);
  console.log(`✓ Parsed API reference with ${docHooks.length} documented hooks\n`);

  // Validate
  const issues = validateAgainstSchema(docHooks, schema);

  if (issues.length === 0) {
    console.log('✅ All hooks documentation matches schema!\n');
    process.exit(0);
  }

  console.log('❌ Documentation drift detected:\n');

  // Group issues by type
  const byType = {};
  issues.forEach(issue => {
    if (!byType[issue.type]) byType[issue.type] = [];
    byType[issue.type].push(issue);
  });

  // Report issues
  Object.entries(byType).forEach(([type, typeIssues]) => {
    console.log(`\n📌 ${type.toUpperCase()} (${typeIssues.length}):`);
    typeIssues.forEach(issue => {
      console.log(`   ${issue.message}`);
      if (issue.expected) {
        console.log(`   Expected: ${issue.expected}`);
        console.log(`   Actual:   ${issue.actual}`);
      }
    });
  });

  console.log('\n' + '='.repeat(70));
  console.log(`Total issues: ${issues.length}`);
  console.log('='.repeat(70) + '\n');

  console.log('To fix this issue:');
  console.log('1. Update docs/hooks/api-reference.mdx to match the actual SDK signatures');
  console.log('2. Or update scripts/hooks-schema.json if the schema is outdated');
  console.log('3. Run this script again to verify\n');

  process.exit(1);
}

main().catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
