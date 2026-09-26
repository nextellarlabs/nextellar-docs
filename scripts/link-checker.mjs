#!/usr/bin/env node

/**
 * Robust recursive link checker for nextellar-docs
 * Validates internal links (with anchor support) and optionally checks external links
 * 
 * Usage:
 *   node scripts/link-checker.mjs [options]
 * 
 * Options:
 *   --check-external    Enable external link checking (default: disabled)
 *   --timeout NUMBER    Request timeout in ms (default: 5000)
 *   --max-concurrent N  Max concurrent external requests (default: 5)
 *   --allowlist FILE    JSON file with URLs to skip
 *   --verbose           Verbose output
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import http from 'http';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.join(__dirname, '..', 'docs');

// ============================================================================
// CONFIGURATION
// ============================================================================

const config = {
  checkExternal: process.argv.includes('--check-external'),
  timeout: parseInt(process.argv.find(arg => arg.startsWith('--timeout='))?.split('=')[1] || '5000'),
  maxConcurrent: parseInt(process.argv.find(arg => arg.startsWith('--max-concurrent='))?.split('=')[1] || '5'),
  allowlistFile: process.argv.find(arg => arg.startsWith('--allowlist='))?.split('=')[1],
  verbose: process.argv.includes('--verbose'),
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Generate heading ID from text using remark-slug logic
 * Matches: https://github.com/remarkjs/remark-slug
 */
function generateHeadingId(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/[^\w-]/g, '')         // Remove non-word chars except hyphens
    .replace(/--+/g, '-')           // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '');       // Remove leading/trailing hyphens
}

/**
 * Extract all markdown headings from content
 * Returns array of { level, text, id }
 */
function extractHeadings(content) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = generateHeadingId(text);
    headings.push({ level, text, id });
  }

  return headings;
}

/**
 * Extract all links from markdown/MDX content
 * Returns array of { text, href, line, isExternal }
 */
function extractLinks(content) {
  const links = [];
  
  // Markdown links: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  let lineNum = 1;

  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    let lineMatch;
    while ((lineMatch = markdownLinkRegex.exec(line)) !== null) {
      const text = lineMatch[1];
      const href = lineMatch[2];
      const isExternal = href.startsWith('http://') || href.startsWith('https://');
      
      links.push({
        text,
        href,
        line: idx + 1,
        isExternal,
      });
    }
  });

  return links;
}

/**
 * Resolve relative link to actual file path
 * Handles: ../file, ./file, /docs/file, docs/file
 */
function resolveLink(fromFile, href) {
  const baseDir = path.dirname(fromFile);
  
  // Remove fragment
  const [linkPath] = href.split('#');
  
  if (!linkPath) return { file: fromFile, fragment: href.substring(1) };

  let resolved;
  
  if (linkPath.startsWith('/')) {
    // Absolute path from docs root
    resolved = path.join(docsRoot, linkPath);
  } else {
    // Relative path
    resolved = path.resolve(baseDir, linkPath);
  }

  // Ensure it's within docs root (security check)
  const normalized = path.normalize(resolved);
  const docsDirNormalized = path.normalize(docsRoot);
  
  if (!normalized.startsWith(docsDirNormalized)) {
    return null; // Outside docs root
  }

  // Add .mdx/.md extension if missing
  let finalPath = normalized;
  if (!finalPath.endsWith('.mdx') && !finalPath.endsWith('.md')) {
    // Try .mdx first, then .md
    if (fs.existsSync(normalized + '.mdx')) {
      finalPath = normalized + '.mdx';
    } else if (fs.existsSync(normalized + '.md')) {
      finalPath = normalized + '.md';
    } else if (fs.existsSync(normalized) && fs.statSync(normalized).isDirectory()) {
      // Check for index.mdx in directory
      const indexPath = path.join(normalized, 'index.mdx');
      if (fs.existsSync(indexPath)) {
        finalPath = indexPath;
      } else {
        finalPath = null;
      }
    } else {
      finalPath = null;
    }
  }

  return {
    file: finalPath,
    fragment: href.includes('#') ? href.split('#')[1] : null,
  };
}

/**
 * Get all MDX/MD files recursively
 */
function getAllDocFiles(dir = docsRoot) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllDocFiles(fullPath));
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  });

  return files;
}

/**
 * Load allowlist of URLs to skip
 */
function loadAllowlist() {
  if (!config.allowlistFile) return new Set();
  
  try {
    const content = fs.readFileSync(config.allowlistFile, 'utf-8');
    const data = JSON.parse(content);
    return new Set(data.urls || []);
  } catch (err) {
    console.error(`Failed to load allowlist: ${err.message}`);
    return new Set();
  }
}

/**
 * Format file path relative to docs root for clearer output
 */
function formatPath(fullPath) {
  return path.relative(docsRoot, fullPath);
}

// ============================================================================
// INTERNAL LINK VALIDATION
// ============================================================================

/**
 * Validate internal links in a file
 */
function validateInternalLinks(filePath, content) {
  const issues = [];
  const links = extractLinks(content);
  const internalLinks = links.filter(link => !link.isExternal);

  internalLinks.forEach(link => {
    const resolved = resolveLink(filePath, link.href);

    if (!resolved) {
      issues.push({
        type: 'invalid-path',
        file: formatPath(filePath),
        line: link.line,
        link: link.href,
        text: link.text,
        message: `Link points outside docs root: ${link.href}`,
      });
      return;
    }

    if (!resolved.file) {
      issues.push({
        type: 'broken-link',
        file: formatPath(filePath),
        line: link.line,
        link: link.href,
        text: link.text,
        message: `Target file not found: ${link.href}`,
      });
      return;
    }

    if (resolved.fragment) {
      // Validate anchor
      try {
        const targetContent = fs.readFileSync(resolved.file, 'utf-8');
        const headings = extractHeadings(targetContent);
        const headingIds = headings.map(h => h.id);

        if (!headingIds.includes(resolved.fragment)) {
          issues.push({
            type: 'broken-anchor',
            file: formatPath(filePath),
            line: link.line,
            link: link.href,
            text: link.text,
            targetFile: formatPath(resolved.file),
            fragment: resolved.fragment,
            availableHeadings: headingIds,
            message: `Anchor not found: ${resolved.fragment} in ${formatPath(resolved.file)}`,
          });
        }
      } catch (err) {
        issues.push({
          type: 'anchor-validation-error',
          file: formatPath(filePath),
          line: link.line,
          link: link.href,
          text: link.text,
          message: `Failed to validate anchor: ${err.message}`,
        });
      }
    }
  });

  return issues;
}

// ============================================================================
// EXTERNAL LINK VALIDATION
// ============================================================================

/**
 * Check external link with HEAD request, fallback to GET
 */
async function checkExternalLink(url, attempt = 1) {
  return new Promise((resolve) => {
    const makeRequest = (method) => {
      const urlObj = new URL(url);
      const client = url.startsWith('https') ? https : http;
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'User-Agent': 'nextellar-link-checker/1.0',
        },
        timeout: config.timeout,
      };

      const req = client.request(options, (res) => {
        resolve({
          url,
          status: res.statusCode,
          method,
          success: res.statusCode < 400,
        });
      });

      req.on('error', (err) => {
        if (method === 'HEAD' && attempt < 2) {
          // Fallback to GET
          makeRequest('GET');
        } else {
          resolve({
            url,
            error: err.message,
            method,
            success: false,
          });
        }
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          error: `Timeout after ${config.timeout}ms`,
          method,
          success: false,
        });
      });

      req.end();
    };

    makeRequest('HEAD');
  });
}

/**
 * Validate external links with concurrency control
 */
async function validateExternalLinks(links) {
  const results = [];
  const queue = links.slice();
  let active = 0;

  return new Promise((resolve) => {
    const processNext = () => {
      if (queue.length === 0 && active === 0) {
        resolve(results);
        return;
      }

      while (active < config.maxConcurrent && queue.length > 0) {
        active++;
        const link = queue.shift();

        checkExternalLink(link.href).then((result) => {
          results.push({
            ...link,
            ...result,
          });
          active--;
          processNext();
        });
      }
    };

    processNext();
  });
}

// ============================================================================
// MAIN CHECKER
// ============================================================================

async function runLinkChecker() {
  console.log('🔗 Nextellar Link Checker\n');

  const allFiles = getAllDocFiles();
  const allowlist = loadAllowlist();
  
  console.log(`📂 Scanning ${allFiles.length} documentation files...\n`);

  let internalIssues = [];
  let externalLinks = [];
  const fileHeadings = new Map();

  // Phase 1: Scan all files for links and headings
  allFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Extract headings for reference
      const headings = extractHeadings(content);
      fileHeadings.set(filePath, headings);

      // Validate internal links
      const issues = validateInternalLinks(filePath, content);
      internalIssues = internalIssues.concat(issues);

      // Collect external links
      if (config.checkExternal) {
        const links = extractLinks(content);
        const externalOnly = links
          .filter(link => link.isExternal && !allowlist.has(link.href))
          .map(link => ({ ...link, sourceFile: filePath }));
        externalLinks = externalLinks.concat(externalOnly);
      }
    } catch (err) {
      console.error(`Error reading file ${formatPath(filePath)}: ${err.message}`);
      process.exit(1);
    }
  });

  // Phase 2: Check external links (if enabled)
  let externalIssues = [];
  if (config.checkExternal && externalLinks.length > 0) {
    console.log(`🌐 Checking ${externalLinks.length} external links...`);
    const uniqueUrls = [...new Set(externalLinks.map(l => l.href))];
    const results = await validateExternalLinks(uniqueUrls.map(href => ({ href })));

    externalIssues = results
      .filter(result => !result.success)
      .flatMap(result => {
        return externalLinks
          .filter(link => link.href === result.url)
          .map(link => ({
            type: 'broken-external-link',
            file: formatPath(link.sourceFile),
            line: link.line,
            link: link.href,
            text: link.text,
            error: result.error || `HTTP ${result.status}`,
            message: `External link failed: ${result.error || `HTTP ${result.status}`}`,
          }));
      });
  }

  // =========================================================================
  // REPORT RESULTS
  // =========================================================================

  console.log('\n' + '='.repeat(70));
  console.log('LINK VALIDATION RESULTS');
  console.log('='.repeat(70) + '\n');

  if (internalIssues.length === 0 && externalIssues.length === 0) {
    console.log('✅ All links valid!\n');
    console.log(`📊 Summary:`);
    console.log(`   Internal links: OK`);
    if (config.checkExternal) {
      console.log(`   External links: OK (${externalLinks.length} checked)`);
    }
    return { success: true, totalIssues: 0 };
  }

  // Group issues by type
  const issuesByType = {};
  const allIssues = [...internalIssues, ...externalIssues];

  allIssues.forEach(issue => {
    if (!issuesByType[issue.type]) {
      issuesByType[issue.type] = [];
    }
    issuesByType[issue.type].push(issue);
  });

  // Report internal issues
  if (internalIssues.length > 0) {
    console.log('❌ INTERNAL LINK ISSUES:\n');

    ['broken-link', 'broken-anchor', 'invalid-path', 'anchor-validation-error'].forEach(type => {
      const issues = issuesByType[type] || [];
      if (issues.length === 0) return;

      const typeLabel = {
        'broken-link': 'Broken Internal Links',
        'broken-anchor': 'Broken Anchors',
        'invalid-path': 'Invalid Paths',
        'anchor-validation-error': 'Anchor Validation Errors',
      }[type];

      console.log(`\n📌 ${typeLabel} (${issues.length}):`);
      issues.forEach(issue => {
        console.log(`\n   File: ${issue.file}:${issue.line}`);
        console.log(`   Link: [${issue.text}](${issue.link})`);
        console.log(`   Error: ${issue.message}`);
        
        if (issue.availableHeadings && issue.availableHeadings.length > 0) {
          console.log(`   Available anchors: ${issue.availableHeadings.join(', ')}`);
        }
      });
    });
  }

  // Report external issues
  if (externalIssues.length > 0) {
    console.log('\n\n❌ EXTERNAL LINK ISSUES:\n');
    console.log(`🌐 Broken External Links (${externalIssues.length}):`);
    externalIssues.forEach(issue => {
      console.log(`\n   File: ${issue.file}:${issue.line}`);
      console.log(`   Link: [${issue.text}](${issue.link})`);
      console.log(`   Error: ${issue.error}`);
    });
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 SUMMARY\n');
  console.log(`Total files scanned: ${allFiles.length}`);
  console.log(`Internal link issues: ${internalIssues.length}`);
  if (config.checkExternal) {
    console.log(`External links checked: ${externalLinks.length}`);
    console.log(`External link issues: ${externalIssues.length}`);
  }
  console.log(`\nTotal issues: ${allIssues.length}`);
  console.log('='.repeat(70) + '\n');

  return {
    success: false,
    totalIssues: allIssues.length,
    internalIssues,
    externalIssues,
  };
}

// ============================================================================
// EXECUTION
// ============================================================================

(async () => {
  try {
    const result = await runLinkChecker();
    process.exit(result.success ? 0 : 1);
  } catch (err) {
    console.error(`Fatal error: ${err.message}`);
    process.exit(1);
  }
})();
