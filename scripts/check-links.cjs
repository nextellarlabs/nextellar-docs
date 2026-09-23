// scripts/check-links.cjs - Static link validation without dev server
const fs = require('fs');
const path = require('path');

// Configuration
const DOCS_DIR = path.join(__dirname, '../docs');
const DOCS_BASE = '/docs';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Recursively walk the docs directory and collect all .mdx and .md files
 */
function walkDocs(dir = DOCS_DIR, fileList = []) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDocs(filePath, fileList);
      } else if (file.endsWith('.mdx') || file.endsWith('.md')) {
        fileList.push(filePath);
      }
    });
  } catch (err) {
    // Silently skip directories that can't be read
  }

  return fileList;
}

/**
 * Convert a file path to its URL route
 * e.g., "docs/components/button.mdx" -> "/docs/components/button"
 * e.g., "docs/getting-started/index.mdx" -> "/docs/getting-started"
 */
function filePathToRoute(filePath) {
  const relative = path.relative(DOCS_DIR, filePath);
  const withoutExt = relative.replace(/\.(mdx|md)$/, '');
  const normalized = withoutExt.split(path.sep).join('/');
  
  // Handle index files -> they resolve to the directory
  if (normalized.endsWith('/index')) {
    return DOCS_BASE + '/' + normalized.replace(/\/index$/, '');
  }
  
  return DOCS_BASE + '/' + normalized;
}

/**
 * Extract all headings (anchors) from a markdown file
 * Looks for Markdown headings (# ## ### etc.) and HTML heading elements
 */
function extractAnchors(content) {
  const anchors = new Set();
  
  // Match Markdown headings: # Heading, ## Subheading, etc.
  const headingRegex = /^#+\s+(.+?)(?:\s*\{.*?\})?$/gm;
  // Match HTML id attributes
  const slugRegex = /id=['"]([\w-]+)['"]/g;

  let match;

  // Extract from Markdown headings
  while ((match = headingRegex.exec(content)) !== null) {
    const heading = match[1].trim();
    // Convert heading to URL slug (lowercase, spaces to hyphens, remove special chars)
    const slug = heading
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    if (slug) {
      anchors.add(slug);
    }
  }

  // Extract from HTML id attributes
  while ((match = slugRegex.exec(content)) !== null) {
    anchors.add(match[1]);
  }

  return anchors;
}

/**
 * Extract all internal links from markdown content
 * Returns array of {href, type, lineNum, text}
 */
function extractLinks(content) {
  const links = [];
  const lines = content.split('\n');

  lines.forEach((line, lineNum) => {
    // Extract Markdown links: [text](url)
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let mdMatch;
    while ((mdMatch = mdLinkRegex.exec(line)) !== null) {
      const href = mdMatch[2];
      // Only track internal links (starting with / or relative, but not external URLs)
      if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        links.push({ href, type: 'markdown', lineNum: lineNum + 1, text: mdMatch[1] });
      }
    }

    // Extract HTML href attributes: href="url"
    const htmlHrefRegex = /href=['"](([^'"]+))['"]/g;
    let htmlMatch;
    while ((htmlMatch = htmlHrefRegex.exec(line)) !== null) {
      const href = htmlMatch[1];
      // Only track internal links (starting with / or relative, but not external URLs)
      if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        links.push({ href, type: 'html', lineNum: lineNum + 1 });
      }
    }
  });

  return links;
}

/**
 * Normalize a link href to a canonical form for comparison
 * Handles both /getting-started/... and /docs/getting-started/... formats
 */
function normalizeHref(href) {
  // Remove trailing slashes and query params/fragments
  let normalized = href.split('#')[0].split('?')[0].replace(/\/$/, '');
  
  // If it doesn't start with /, treat as relative (we'll resolve elsewhere)
  if (!normalized.startsWith('/')) {
    return normalized;
  }
  
  // Ensure it has the /docs prefix for comparison
  if (!normalized.startsWith('/docs/')) {
    // Add /docs prefix if missing
    normalized = '/docs' + normalized;
  }
  
  return normalized;
}

/**
 * Resolve a link target to check if it exists
 * Returns {valid, reason}
 */
function resolveLink(href, fromRoute, knownRoutes, anchors) {
  // Handle anchor-only links (within same page)
  if (href.startsWith('#')) {
    const anchor = href.slice(1);
    const pageAnchors = anchors.get(fromRoute);
    if (pageAnchors && pageAnchors.has(anchor)) {
      return { valid: true, reason: 'anchor exists' };
    }
    return { valid: false, reason: `anchor '#${anchor}' not found on this page` };
  }

  // Normalize the href
  let targetRoute = normalizeHref(href);

  // Check if this route exists (exact match)
  if (knownRoutes.has(targetRoute)) {
    return { valid: true, reason: 'page exists' };
  }

  // Check if it matches the without /docs variant (for backward compat check)
  const withoutDocs = targetRoute.replace(/^\/docs/, '');
  if (withoutDocs !== targetRoute && knownRoutes.has(withoutDocs)) {
    return { valid: true, reason: 'page exists' };
  }

  return { valid: false, reason: 'page not found' };
}

/**
 * Main function to check all links
 */
function checkLinks() {
  console.log(`${colors.cyan}🔗 STATIC LINK CRAWLER${colors.reset}\n`);
  console.log(`Scanning docs directory: ${DOCS_DIR}\n`);

  // Step 1: Collect all doc files
  const docFiles = walkDocs();
  console.log(`${colors.blue}Found ${docFiles.length} documentation files${colors.reset}\n`);

  // Step 2: Build map of known routes and their anchors
  const knownRoutes = new Set();
  const anchors = new Map();

  docFiles.forEach((filePath) => {
    const route = filePathToRoute(filePath);
    knownRoutes.add(route);

    // Extract anchors from this file
    const content = fs.readFileSync(filePath, 'utf-8');
    anchors.set(route, extractAnchors(content));
  });

  // Step 3: Extract and validate links from all files
  const brokenLinks = [];
  const externalLinks = [];
  let totalLinks = 0;
  let validLinks = 0;

  docFiles.forEach((filePath) => {
    const route = filePathToRoute(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const links = extractLinks(content);

    links.forEach((link) => {
      // Skip anchor-only and external links for now
      if (link.href.startsWith('#') || link.href.startsWith('http')) {
        return;
      }

      totalLinks++;
      const result = resolveLink(link.href, route, knownRoutes, anchors);

      if (!result.valid) {
        brokenLinks.push({
          file: filePath,
          route,
          href: link.href,
          lineNum: link.lineNum,
          type: link.type,
          text: link.text,
          reason: result.reason,
        });
      } else {
        validLinks++;
      }
    });
  });

  // Step 4: Report results
  console.log(`${colors.blue}Validation Results:${colors.reset}`);
  console.log(`✅ Valid links: ${validLinks}/${totalLinks}`);

  if (brokenLinks.length > 0) {
    console.log(`${colors.red}❌ Broken links: ${brokenLinks.length}${colors.reset}\n`);
    console.log(`${colors.yellow}Broken Links Report:${colors.reset}\n`);

    // Group broken links by file for easier reading
    const linksByFile = {};
    brokenLinks.forEach((link) => {
      if (!linksByFile[link.route]) {
        linksByFile[link.route] = [];
      }
      linksByFile[link.route].push(link);
    });

    let idx = 1;
    Object.keys(linksByFile).forEach((route) => {
      console.log(`${colors.cyan}${route}${colors.reset}`);
      linksByFile[route].forEach((link) => {
        console.log(`  ${colors.red}[${idx}]${colors.reset} Line ${link.lineNum}`);
        console.log(`       ${colors.yellow}Link: ${link.href}${colors.reset}`);
        console.log(`       ${colors.red}Error: ${link.reason}${colors.reset}`);
        if (link.text) {
          console.log(`       Text: "${link.text}"`);
        }
        idx++;
      });
      console.log();
    });

    console.log(`${colors.red}❌ VALIDATION FAILED - ${brokenLinks.length} broken link(s) found${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}🎉 ALL LINKS VALID!${colors.reset}`);
    process.exit(0);
  }
}

// Run the checker
checkLinks();
