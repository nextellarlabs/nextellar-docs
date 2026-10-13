#!/usr/bin/env python3
"""
Manual link checker for nextellar-docs
Replicates the functionality of scripts/check-links.cjs
"""

import os
import re
from pathlib import Path
from collections import defaultdict

# Colors for output
class Colors:
    RESET = '\033[0m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    CYAN = '\033[36m'

DOCS_DIR = Path(__file__).parent / 'docs'
DOCS_BASE = '/docs'

def walk_docs(directory=DOCS_DIR):
    """Recursively collect all .mdx and .md files"""
    file_list = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.mdx', '.md')):
                file_list.append(Path(root) / file)
    return sorted(file_list)

def file_path_to_route(file_path):
    """Convert file path to URL route"""
    relative = file_path.relative_to(DOCS_DIR)
    without_ext = re.sub(r'\.(mdx|md)$', '', str(relative))
    normalized = without_ext.replace('\\', '/')
    
    # Handle index files
    if normalized.endswith('/index'):
        return DOCS_BASE + '/' + normalized.replace('/index', '')
    
    return DOCS_BASE + '/' + normalized

def extract_anchors(content):
    """Extract all headings and id attributes from markdown/html"""
    anchors = set()
    
    # Markdown headings: # Heading, ## Subheading, etc.
    heading_pattern = r'^#+\s+(.+?)(?:\s*\{.*?\})?$'
    for match in re.finditer(heading_pattern, content, re.MULTILINE):
        heading = match.group(1).strip()
        # Convert heading to slug
        slug = heading.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = slug.strip()
        slug = re.sub(r'\s+', '-', slug)
        slug = re.sub(r'-+', '-', slug)
        if slug:
            anchors.add(slug)
    
    # HTML id attributes
    id_pattern = r"id=['\"]([\\w-]+)['\"]"
    for match in re.finditer(id_pattern, content):
        anchors.add(match.group(1))
    
    return anchors

def extract_links(content):
    """Extract internal links from markdown"""
    links = []
    lines = content.split('\n')
    
    for line_num, line in enumerate(lines, 1):
        # Markdown links: [text](url)
        md_link_pattern = r'\[([^\]]+)\]\(([^)]+)\)'
        for match in re.finditer(md_link_pattern, line):
            href = match.group(2)
            # Only internal links
            if not href.startswith(('http', 'mailto:', 'tel:')):
                links.append({
                    'href': href,
                    'type': 'markdown',
                    'lineNum': line_num,
                    'text': match.group(1)
                })
        
        # HTML href attributes
        html_href_pattern = r"href=['\"]([^'\"]+)['\"]"
        for match in re.finditer(html_href_pattern, line):
            href = match.group(1)
            # Only internal links
            if not href.startswith(('http', 'mailto:', 'tel:')):
                links.append({
                    'href': href,
                    'type': 'html',
                    'lineNum': line_num
                })
    
    return links

def normalize_href(href):
    """Normalize link href for comparison"""
    # Remove trailing slashes and query params/fragments
    normalized = href.split('#')[0].split('?')[0].rstrip('/')
    
    if not normalized.startswith('/'):
        return normalized
    
    # Ensure /docs prefix
    if not normalized.startswith('/docs/'):
        normalized = '/docs' + normalized
    
    return normalized

def resolve_link(href, from_route, known_routes, anchors):
    """Check if a link target exists"""
    # Anchor-only links
    if href.startswith('#'):
        anchor = href[1:]
        page_anchors = anchors.get(from_route, set())
        if anchor in page_anchors:
            return {'valid': True, 'reason': 'anchor exists'}
        return {'valid': False, 'reason': f"anchor '#{anchor}' not found on this page"}
    
    # Normalize the href
    target_route = normalize_href(href)
    
    # Check if route exists
    if target_route in known_routes:
        return {'valid': True, 'reason': 'page exists'}
    
    # Check without /docs variant
    without_docs = target_route.replace('/docs', '', 1)
    if without_docs != target_route and without_docs in known_routes:
        return {'valid': True, 'reason': 'page exists'}
    
    return {'valid': False, 'reason': 'page not found'}

def main():
    print(f"{Colors.CYAN}🔗 STATIC LINK CRAWLER{Colors.RESET}\n")
    print(f"Scanning docs directory: {DOCS_DIR}\n")
    
    # Collect all doc files
    doc_files = walk_docs()
    print(f"{Colors.BLUE}Found {len(doc_files)} documentation files{Colors.RESET}\n")
    
    # Build map of known routes and anchors
    known_routes = set()
    anchors = {}
    
    for file_path in doc_files:
        route = file_path_to_route(file_path)
        known_routes.add(route)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            anchors[route] = extract_anchors(content)
    
    # Extract and validate links
    broken_links = []
    total_links = 0
    valid_links = 0
    
    for file_path in doc_files:
        route = file_path_to_route(file_path)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        links = extract_links(content)
        
        for link in links:
            # Skip anchors and external links
            if link['href'].startswith('#') or link['href'].startswith('http'):
                continue
            
            total_links += 1
            result = resolve_link(link['href'], route, known_routes, anchors)
            
            if not result['valid']:
                broken_links.append({
                    'file': file_path,
                    'route': route,
                    'href': link['href'],
                    'lineNum': link['lineNum'],
                    'type': link['type'],
                    'text': link.get('text', ''),
                    'reason': result['reason']
                })
            else:
                valid_links += 1
    
    # Report results
    print(f"{Colors.BLUE}Validation Results:{Colors.RESET}")
    print(f"✅ Valid links: {valid_links}/{total_links}")
    
    if broken_links:
        print(f"{Colors.RED}❌ Broken links: {len(broken_links)}{Colors.RESET}\n")
        print(f"{Colors.YELLOW}Broken Links Report:{Colors.RESET}\n")
        
        # Group by file
        links_by_file = defaultdict(list)
        for link in broken_links:
            links_by_file[link['route']].append(link)
        
        idx = 1
        for route in sorted(links_by_file.keys()):
            print(f"{Colors.CYAN}{route}{Colors.RESET}")
            for link in links_by_file[route]:
                print(f"  {Colors.RED}[{idx}]{Colors.RESET} Line {link['lineNum']}")
                print(f"       {Colors.YELLOW}Link: {link['href']}{Colors.RESET}")
                print(f"       {Colors.RED}Error: {link['reason']}{Colors.RESET}")
                if link['text']:
                    print(f"       Text: \"{link['text']}\"")
                idx += 1
            print()
        
        print(f"{Colors.RED}❌ VALIDATION FAILED - {len(broken_links)} broken link(s) found{Colors.RESET}")
        return 1
    else:
        print(f"{Colors.GREEN}🎉 ALL LINKS VALID!{Colors.RESET}")
        return 0

if __name__ == '__main__':
    exit(main())
