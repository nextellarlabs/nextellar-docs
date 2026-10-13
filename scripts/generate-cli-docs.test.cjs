/**
 * Unit tests for CLI documentation generator
 * 
 * Tests the parsing and generation of CLI documentation from --help output.
 * Uses fixture text rather than invoking a live CLI.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const {
  parseHelpText,
  generateMDX,
  parseArguments,
  parseOptions,
  parseExamples
} = require('./generate-cli-docs.cjs');

/**
 * Load fixture text
 */
function loadFixture(filename) {
  const filepath = path.join(__dirname, '__fixtures__', filename);
  return fs.readFileSync(filepath, 'utf8');
}

// ============================================================================
// Test Runner (Simple assertion-based)
// ============================================================================

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
  testsRun++;
  try {
    fn();
    testsPassed++;
    console.log(`✓ ${name}`);
  } catch (err) {
    testsFailed++;
    console.log(`✗ ${name}`);
    console.log(`  Error: ${err.message}`);
  }
}

function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}

// ============================================================================
// Tests
// ============================================================================

describe('parseArguments', () => {
  test('parses simple arguments', () => {
    const text = `<project-name>     Name of your project directory`;
    const args = parseArguments(text);
    assert.strictEqual(args.length, 1);
    assert.strictEqual(args[0].name, 'project-name');
  });

  test('parses multiple arguments', () => {
    const text = `<project-name>     Name of your project directory
  <feature-name>     Name of the feature to add`;
    const args = parseArguments(text);
    assert.strictEqual(args.length, 2);
  });
});

describe('parseOptions', () => {
  test('parses simple short flag', () => {
    const text = `-h, --help                    Show this help text`;
    const opts = parseOptions(text);
    assert.strictEqual(opts.length, 1);
    assert(opts[0].flags.includes('-h'));
  });

  test('parses long flag with argument', () => {
    const text = `--package-manager <pm>        Choose package manager`;
    const opts = parseOptions(text);
    assert.strictEqual(opts.length, 1);
    assert(opts[0].flags.includes('--package-manager'));
  });

  test('parses multiple options', () => {
    const text = `-t, --typescript              Generate a TypeScript project
  -j, --javascript              Generate a JavaScript project`;
    const opts = parseOptions(text);
    assert(opts.length >= 2);
  });
});

describe('parseHelpText', () => {
  test('parses basic help structure', () => {
    const helpText = `Usage: nextellar <project-name>
Description: Create a new Stellar dApp project.`;
    const result = parseHelpText(helpText);
    assert(result.usage.includes('nextellar'));
    assert(result.description.includes('Stellar'));
  });

  test('parses fixture: nextellar main command', () => {
    const helpText = loadFixture('nextellar-help.txt');
    const result = parseHelpText(helpText);

    assert(result.usage.includes('nextellar'));
    assert.strictEqual(result.arguments.length, 1);
    assert(result.options.length > 5);
    assert(result.examples.length > 0);
  });

  test('parses fixture: nextellar add subcommand', () => {
    const helpText = loadFixture('nextellar-add-help.txt');
    const result = parseHelpText(helpText);

    assert(result.usage.includes('nextellar add'));
    assert(result.options.length > 3);
    assert(result.examples.length > 0);
  });

  test('preserves raw help text', () => {
    const helpText = `Usage: test
Description: Test command`;
    const result = parseHelpText(helpText);
    assert.strictEqual(result.rawText, helpText);
  });
});

describe('generateMDX', () => {
  test('generates MDX with frontmatter', () => {
    const parsed = {
      usage: 'nextellar <project-name>',
      description: 'Create a new project',
      arguments: [],
      options: [],
      examples: []
    };
    const mdx = generateMDX('nextellar', parsed);
    
    assert(mdx.includes('---'));
    assert(mdx.includes('title:'));
    assert(mdx.includes('description:'));
    assert(mdx.includes('date:'));
  });

  test('generates frontmatter with current date', () => {
    const parsed = {
      usage: 'nextellar',
      description: 'Test',
      arguments: [],
      options: [],
      examples: []
    };
    const mdx = generateMDX('nextellar', parsed);
    
    const now = new Date().toISOString().split('T')[0];
    assert(mdx.includes(`date: ${now}`));
  });

  test('generates arguments section', () => {
    const parsed = {
      usage: 'nextellar',
      description: 'Test',
      arguments: [{ name: 'project-name', description: 'Project directory' }],
      options: [],
      examples: []
    };
    const mdx = generateMDX('nextellar', parsed);
    
    assert(mdx.includes('## Arguments'));
    assert(mdx.includes('project-name'));
  });

  test('generates options section', () => {
    const parsed = {
      usage: 'nextellar',
      description: 'Test',
      arguments: [],
      options: [
        { flags: ['-h', '--help'], description: 'Show help' }
      ],
      examples: []
    };
    const mdx = generateMDX('nextellar', parsed);
    
    assert(mdx.includes('## Options'));
    assert(mdx.includes('-h, --help'));
  });

  test('generates examples section', () => {
    const parsed = {
      usage: 'nextellar',
      description: 'Test',
      arguments: [],
      options: [],
      examples: [
        { code: 'nextellar my-app', description: 'Basic usage' }
      ]
    };
    const mdx = generateMDX('nextellar', parsed);
    
    assert(mdx.includes('## Examples'));
    assert(mdx.includes('Basic usage'));
    assert(mdx.includes('```bash'));
  });

  test('generates MDX from fixture', () => {
    const helpText = loadFixture('nextellar-help.txt');
    const parsed = parseHelpText(helpText);
    const mdx = generateMDX('nextellar', parsed);

    assert(mdx.includes('Create a new Stellar dApp'));
    assert(mdx.includes('--typescript'));
  });
});

describe('Integration: End-to-end', () => {
  test('parses and generates nextellar main command', () => {
    const helpText = loadFixture('nextellar-help.txt');
    const parsed = parseHelpText(helpText);
    const mdx = generateMDX('nextellar', parsed);

    assert(mdx.includes('Create a new Stellar dApp'));
    assert(mdx.includes('--typescript'));
  });

  test('parses and generates nextellar add subcommand', () => {
    const helpText = loadFixture('nextellar-add-help.txt');
    const parsed = parseHelpText(helpText);
    const mdx = generateMDX('nextellar add', parsed);

    assert(mdx.includes('Add Stellar features'));
    assert(mdx.includes('--list'));
  });

  test('handles subcommand with no options', () => {
    const helpText = `Usage: nextellar info

Description: Show CLI information.`;
    const parsed = parseHelpText(helpText);
    const mdx = generateMDX('nextellar info', parsed);

    assert(mdx.includes('nextellar info'));
    assert(mdx.includes('Show CLI information'));
  });

  test('handles subcommand with only positional arguments', () => {
    const helpText = `Usage: nextellar add <feature-name>

Description: Add a feature.

Arguments:
  <feature-name>     Feature to add`;
    const parsed = parseHelpText(helpText);
    const mdx = generateMDX('nextellar add', parsed);

    assert(mdx.includes('feature-name'));
    assert(mdx.includes('## Arguments'));
  });
});

// ============================================================================
// Run Tests
// ============================================================================

if (require.main === module) {
  describe('parseArguments', () => {
    test('parses simple arguments', () => {
      const text = `<project-name>     Name of your project directory`;
      const args = parseArguments(text);
      assert.strictEqual(args.length, 1);
      assert.strictEqual(args[0].name, 'project-name');
    });

    test('parses multiple arguments', () => {
      const text = `<project-name>     Name of your project directory
  <feature-name>     Name of the feature to add`;
      const args = parseArguments(text);
      assert.strictEqual(args.length, 2);
    });
  });

  describe('parseOptions', () => {
    test('parses simple short flag', () => {
      const text = `-h, --help                    Show this help text`;
      const opts = parseOptions(text);
      assert.strictEqual(opts.length, 1);
      assert(opts[0].flags.includes('-h'));
    });

    test('parses long flag with argument', () => {
      const text = `--package-manager <pm>        Choose package manager`;
      const opts = parseOptions(text);
      assert.strictEqual(opts.length, 1);
      assert(opts[0].flags.includes('--package-manager'));
    });
  });

  describe('parseHelpText', () => {
    test('parses basic help structure', () => {
      const helpText = `Usage: nextellar <project-name>
Description: Create a new Stellar dApp project.`;
      const result = parseHelpText(helpText);
      assert(result.usage.includes('nextellar'));
      assert(result.description.includes('Stellar'));
    });

    test('parses fixture: nextellar main command', () => {
      const helpText = loadFixture('nextellar-help.txt');
      const result = parseHelpText(helpText);
      assert(result.usage.includes('nextellar'));
      assert.strictEqual(result.arguments.length, 1);
      assert(result.options.length > 5);
    });

    test('parses fixture: nextellar add subcommand', () => {
      const helpText = loadFixture('nextellar-add-help.txt');
      const result = parseHelpText(helpText);
      assert(result.usage.includes('nextellar add'));
    });
  });

  describe('generateMDX', () => {
    test('generates MDX with frontmatter', () => {
      const parsed = {
        usage: 'nextellar <project-name>',
        description: 'Create a new project',
        arguments: [],
        options: [],
        examples: []
      };
      const mdx = generateMDX('nextellar', parsed);
      assert(mdx.includes('---'));
      assert(mdx.includes('title:'));
    });

    test('generates MDX from fixture', () => {
      const helpText = loadFixture('nextellar-help.txt');
      const parsed = parseHelpText(helpText);
      const mdx = generateMDX('nextellar', parsed);
      assert(mdx.includes('Create a new Stellar dApp'));
    });
  });

  describe('Integration', () => {
    test('end-to-end: nextellar main', () => {
      const helpText = loadFixture('nextellar-help.txt');
      const parsed = parseHelpText(helpText);
      const mdx = generateMDX('nextellar', parsed);
      assert(mdx.includes('--typescript'));
    });

    test('end-to-end: nextellar add', () => {
      const helpText = loadFixture('nextellar-add-help.txt');
      const parsed = parseHelpText(helpText);
      const mdx = generateMDX('nextellar add', parsed);
      assert(mdx.includes('Add Stellar features'));
    });
  });

  // Print summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Tests run: ${testsRun}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  console.log(`${'='.repeat(60)}\n`);

  process.exit(testsFailed > 0 ? 1 : 0);
}

module.exports = {
  test,
  describe
};
