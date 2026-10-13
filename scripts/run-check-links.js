#!/usr/bin/env node
/**
 * Simple runner script that executes check-links.cjs and captures output
 * Used for testing in environments with terminal issues
 */
const { spawn } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'check-links.cjs');

console.log('Starting link checker...\n');

const process_result = spawn('node', [scriptPath], {
  cwd: path.dirname(scriptPath),
  stdio: 'inherit', // Inherit stdio for direct terminal output
});

process_result.on('exit', (code) => {
  console.log('\n\nLink checker exited with code:', code);
  process.exit(code);
});

process_result.on('error', (err) => {
  console.error('Failed to start link checker:', err);
  process.exit(1);
});
