#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) out.push(full);
  }
  return out.sort();
}

function rel(file) {
  return path.relative(path.join(__dirname, '..'), file).split(path.sep).join('/');
}

function validateFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  const issues = [];
  let inFence = false;
  let fenceCount = 0;
  let openLine = -1;
  let openMarker = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
    if (!match) continue;
    fenceCount += 1;
    const marker = match[2];
    const info = (match[3] || '').trim();
    if (!inFence) {
      inFence = true;
      openLine = i + 1;
      openMarker = marker;
      continue;
    }

    const sameChar = marker[0] === openMarker[0];
    const longEnough = marker.length >= openMarker.length;
    if (sameChar && longEnough) {
      if (info.length > 0) {
        issues.push({
          line: i + 1,
          message: `closing fence has language/info tag "${info}" (opened at line ${openLine})`,
        });
      }
      inFence = false;
      openLine = -1;
      openMarker = '';
    } else {
      issues.push({
        line: i + 1,
        message: `unexpected fence marker while fence opened at line ${openLine}`,
      });
    }
  }

  if (fenceCount % 2 === 1) {
    issues.push({
      line: openLine > 0 ? openLine : 1,
      message: `odd fence count (${fenceCount}); file has an unclosed or malformed code fence`,
    });
  }
  if (inFence) {
    issues.push({
      line: openLine,
      message: 'code fence opened but never closed',
    });
  }

  return issues;
}

function main() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`docs directory not found: ${DOCS_DIR}`);
    process.exit(1);
  }

  const files = walk(DOCS_DIR);
  let totalIssues = 0;
  const badFiles = [];

  for (const file of files) {
    const issues = validateFile(file);
    if (issues.length > 0) {
      badFiles.push({ file: rel(file), issues });
      totalIssues += issues.length;
    }
  }

  if (badFiles.length > 0) {
    console.error(
      `Fence validation failed: ${totalIssues} issue(s) in ${badFiles.length} file(s)`,
    );
    for (const { file, issues } of badFiles) {
      for (const issue of issues) {
        console.error(`- ${file}:${issue.line} ${issue.message}`);
      }
    }
    process.exit(1);
  }

  console.log(`Fence validation passed: ${files.length} docs files checked.`);
}

main();
