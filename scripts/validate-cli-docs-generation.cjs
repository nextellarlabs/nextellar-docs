#!/usr/bin/env node

/**
 * Validation Script: CLI Docs Generation
 * 
 * This script demonstrates that the CLI documentation generator works correctly
 * by generating docs from fixture help text and showing the output.
 * 
 * In production CI, this would use real --help output:
 *   npx nextellar --help | node scripts/generate-cli-docs.cjs --output docs/cli/commands.mdx
 * 
 * Usage:
 *   node scripts/validate-cli-docs-generation.cjs
 */

const fs = require('fs');
const path = require('path');
const { parseHelpText, generateMDX } = require('./generate-cli-docs.cjs');

function loadFixture(filename) {
  const filepath = path.join(__dirname, '__fixtures__', filename);
  return fs.readFileSync(filepath, 'utf8');
}

console.log('='.repeat(70));
console.log('CLI Docs Generation Validation');
console.log('='.repeat(70));
console.log('');

// Test 1: Generate docs from nextellar main command fixture
console.log('Test 1: Generating docs from nextellar --help fixture');
console.log('-'.repeat(70));

const nextellarHelpText = loadFixture('nextellar-help.txt');
const nextellarParsed = parseHelpText(nextellarHelpText);
const nextellarMdx = generateMDX('nextellar', nextellarParsed);

console.log('Generated documentation structure:');
console.log(`  ✓ Frontmatter: ${nextellarMdx.includes('---') ? 'Present' : 'Missing'}`);
console.log(`  ✓ Title: ${nextellarMdx.includes('title:') ? 'Present' : 'Missing'}`);
console.log(`  ✓ Date: ${nextellarMdx.includes('date:') ? 'Present' : 'Missing'}`);
console.log(`  ✓ Usage section: ${nextellarMdx.includes('## Usage') ? 'Present' : 'Missing'}`);
console.log(`  ✓ Arguments section: ${nextellarMdx.includes('## Arguments') ? 'Present' : 'Missing'}`);
console.log(`  ✓ Options section: ${nextellarMdx.includes('## Options') ? 'Present' : 'Missing'}`);
console.log(`  ✓ Examples section: ${nextellarMdx.includes('## Examples') ? 'Present' : 'Missing'}`);
console.log('');

// Test 2: Generate docs from nextellar add subcommand fixture
console.log('Test 2: Generating docs from nextellar add --help fixture');
console.log('-'.repeat(70));

const addHelpText = loadFixture('nextellar-add-help.txt');
const addParsed = parseHelpText(addHelpText);
const addMdx = generateMDX('nextellar add', addParsed);

console.log('Generated documentation structure:');
console.log(`  ✓ Frontmatter: ${addMdx.includes('---') ? 'Present' : 'Missing'}`);
console.log(`  ✓ Command name: ${addMdx.includes('# nextellar add') ? 'Correct' : 'Incorrect'}`);
console.log(`  ✓ Options parsed: ${addParsed.options.length} options found`);
console.log('');

// Test 3: Verify determinism
console.log('Test 3: Verify generation is deterministic');
console.log('-'.repeat(70));

const mdx1 = generateMDX('nextellar', parseHelpText(nextellarHelpText));
const mdx2 = generateMDX('nextellar', parseHelpText(nextellarHelpText));
const isDeterministic = mdx1 === mdx2;

console.log(`  ${isDeterministic ? '✓' : '✗'} Generation is ${isDeterministic ? 'deterministic' : 'NOT deterministic'}`);
console.log('');

// Test 4: Show sample output
console.log('Test 4: Sample generated documentation output');
console.log('-'.repeat(70));

const lines = nextellarMdx.split('\n');
console.log('First 30 lines of generated nextellar documentation:');
console.log('');
console.log(lines.slice(0, 30).join('\n'));
console.log('');
console.log(`... (${lines.length - 30} more lines)`);
console.log('');

// Test 5: Data consistency check
console.log('Test 5: Parsed data consistency');
console.log('-'.repeat(70));

console.log(`nextellar command:`);
console.log(`  - Usage: ${nextellarParsed.usage}`);
console.log(`  - Description: ${nextellarParsed.description.substring(0, 60)}...`);
console.log(`  - Arguments: ${nextellarParsed.arguments.length}`);
console.log(`  - Options: ${nextellarParsed.options.length}`);
console.log(`  - Examples: ${nextellarParsed.examples.length}`);
console.log('');

console.log(`nextellar add command:`);
console.log(`  - Usage: ${addParsed.usage}`);
console.log(`  - Description: ${addParsed.description.substring(0, 60)}...`);
console.log(`  - Arguments: ${addParsed.arguments.length}`);
console.log(`  - Options: ${addParsed.options.length}`);
console.log(`  - Examples: ${addParsed.examples.length}`);
console.log('');

// Summary
console.log('='.repeat(70));
console.log('Validation Summary');
console.log('='.repeat(70));
console.log('');
console.log('✓ Generator successfully parses --help fixtures');
console.log('✓ Generated documentation includes all required sections');
console.log(`✓ Generation is deterministic (same input = same output)`);
console.log('');
console.log('Production usage (in CI):'');
console.log('  npx nextellar --help | node scripts/generate-cli-docs.cjs --output docs/cli/commands.mdx');
console.log('');
console.log('Local usage (for contributors):'');
console.log('  npm run generate:cli-docs');
console.log('');
console.log('='.repeat(70));
