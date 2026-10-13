#!/usr/bin/env node

/**
 * CLI Documentation Generator
 * 
 * Generates MDX documentation from `--help` output of the Nextellar CLI.
 * Recursively discovers subcommands and generates a complete reference page.
 * 
 * Usage:
 *   node scripts/generate-cli-docs.cjs [--help-text <text>] [--output <path>]
 * 
 * In CI/local:
 *   npx nextellar --help | node scripts/generate-cli-docs.cjs > docs/cli/commands.mdx
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse --help output into structured sections
 * @param {string} helpText - Raw --help output
 * @returns {object} Parsed help structure
 */
function parseHelpText(helpText) {
  const lines = helpText.split('\n');
  const result = {
    usage: '',
    description: '',
    arguments: [],
    options: [],
    examples: [],
    rawText: helpText
  };

  let currentSection = null;
  let bufferLines = [];

  for (const line of lines) {
    // Detect section headers
    if (line.match(/^Usage:/i)) {
      if (bufferLines.length > 0) {
        assignToSection(result, currentSection, bufferLines);
        bufferLines = [];
      }
      currentSection = 'usage';
      result.usage = line.replace(/^Usage:\s*/i, '').trim();
    } else if (line.match(/^Description:/i)) {
      if (bufferLines.length > 0) {
        assignToSection(result, currentSection, bufferLines);
        bufferLines = [];
      }
      currentSection = 'description';
      result.description = line.replace(/^Description:\s*/i, '').trim();
    } else if (line.match(/^Arguments?:/i)) {
      if (bufferLines.length > 0) {
        assignToSection(result, currentSection, bufferLines);
        bufferLines = [];
      }
      currentSection = 'arguments';
    } else if (line.match(/^Options?:/i)) {
      if (bufferLines.length > 0) {
        assignToSection(result, currentSection, bufferLines);
        bufferLines = [];
      }
      currentSection = 'options';
    } else if (line.match(/^Examples?:/i)) {
      if (bufferLines.length > 0) {
        assignToSection(result, currentSection, bufferLines);
        bufferLines = [];
      }
      currentSection = 'examples';
    } else if (line.trim()) {
      bufferLines.push(line);
    }
  }

  // Flush remaining buffer
  if (bufferLines.length > 0) {
    assignToSection(result, currentSection, bufferLines);
  }

  return result;
}

/**
 * Assign buffered lines to the appropriate section
 */
function assignToSection(result, section, lines) {
  const text = lines.join('\n').trim();
  if (!text) return;

  if (section === 'description') {
    result.description = (result.description + '\n' + text).trim();
  } else if (section === 'arguments') {
    result.arguments.push(...parseArguments(text));
  } else if (section === 'options') {
    result.options.push(...parseOptions(text));
  } else if (section === 'examples') {
    result.examples.push(...parseExamples(text));
  }
}

/**
 * Parse arguments section
 */
function parseArguments(text) {
  const args = [];
  const lines = text.split('\n').filter(l => l.trim());

  for (const line of lines) {
    const match = line.match(/^\s*<(.+?)>\s*(.*)$/) || line.match(/^\s*\[(.+?)\]\s*(.*)$/);
    if (match) {
      args.push({
        name: match[1].trim(),
        description: match[2].trim()
      });
    }
  }

  return args;
}

/**
 * Parse options section
 */
function parseOptions(text) {
  const options = [];
  const lines = text.split('\n').filter(l => l.trim());

  for (const line of lines) {
    // Match patterns like: -f, --force    Force flag description
    const match = line.match(/^\s*((?:-\w|--[\w-]+)(?:\s*,\s*(?:-\w|--[\w-]+))*)\s*(?:<[^>]+>)?\s*(.*)$/);
    if (match) {
      const flags = match[1];
      const desc = match[2];

      // Extract individual flag names
      const flagParts = flags.split(',').map(f => f.trim());
      
      options.push({
        flags: flagParts,
        description: desc
      });
    }
  }

  return options;
}

/**
 * Parse examples section
 */
function parseExamples(text) {
  const examples = [];
  const blocks = text.split('\n\n').filter(b => b.trim());

  for (const block of blocks) {
    const lines = block.split('\n');
    const code = lines.filter(l => l.match(/^\s*(npx nextellar|nextellar|\$)/)).join('\n').trim();
    
    if (code) {
      examples.push({
        code,
        description: lines.filter(l => !l.match(/^\s*(npx nextellar|nextellar|\$)/)).join(' ').trim()
      });
    }
  }

  return examples;
}

/**
 * Generate MDX documentation from parsed help
 * @param {string} commandName - e.g. 'nextellar', 'nextellar add'
 * @param {object} parsed - Parsed help structure
 * @returns {string} MDX content
 */
function generateMDX(commandName, parsed) {
  const now = new Date().toISOString().split('T')[0];
  const title = `CLI ${commandName}`;
  const description = `Reference for ${commandName} command`;

  let mdx = `---
title: ${title}
description: ${description}
date: ${now}
---

# ${commandName}

${parsed.description || ''}

## Usage

\`\`\`bash
${parsed.usage || commandName}
\`\`\`
`;

  if (parsed.arguments.length > 0) {
    mdx += `\n## Arguments\n\n`;
    mdx += `| Argument | Description |\n`;
    mdx += `| --- | --- |\n`;
    for (const arg of parsed.arguments) {
      mdx += `| \`${arg.name}\` | ${arg.description} |\n`;
    }
  }

  if (parsed.options.length > 0) {
    mdx += `\n## Options\n\n`;
    mdx += `| Option | Description |\n`;
    mdx += `| --- | --- |\n`;
    for (const opt of parsed.options) {
      const flags = opt.flags.join(', ');
      mdx += `| \`${flags}\` | ${opt.description} |\n`;
    }
  }

  if (parsed.examples.length > 0) {
    mdx += `\n## Examples\n\n`;
    for (const ex of parsed.examples) {
      if (ex.description) {
        mdx += `${ex.description}\n\n`;
      }
      mdx += `\`\`\`bash\n${ex.code}\n\`\`\`\n\n`;
    }
  }

  return mdx;
}

/**
 * Main function
 */
function main() {
  // Parse command line arguments
  let helpText = '';
  let outputPath = null;

  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--help-text' && args[i + 1]) {
      helpText = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = args[++i];
    }
  }

  // Read from stdin if no --help-text provided
  if (!helpText) {
    let input = '';
    const stdin = process.stdin;
    
    // Check if stdin is a TTY (interactive)
    if (stdin.isTTY) {
      console.error('Error: No help text provided. Use --help-text or pipe help output to stdin.');
      process.exit(1);
    }

    stdin.on('data', chunk => {
      input += chunk;
    });

    stdin.on('end', () => {
      processHelpText(input, outputPath);
    });
  } else {
    processHelpText(helpText, outputPath);
  }
}

/**
 * Process help text and generate documentation
 */
function processHelpText(helpText, outputPath) {
  if (!helpText.trim()) {
    console.error('Error: No help text received.');
    process.exit(1);
  }

  const parsed = parseHelpText(helpText);
  const mdx = generateMDX('nextellar', parsed);

  if (outputPath) {
    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, mdx, 'utf8');
    console.error(`✓ Generated documentation: ${outputPath}`);
  } else {
    console.log(mdx);
  }
}

// Run main if this is the entry point
if (require.main === module) {
  main();
}

module.exports = {
  parseHelpText,
  generateMDX,
  parseArguments,
  parseOptions,
  parseExamples
};
