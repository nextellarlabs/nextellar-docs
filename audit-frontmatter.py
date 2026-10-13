#!/usr/bin/env python3
import os
import re
import json
from pathlib import Path

docs_dir = Path('docs')

def extract_frontmatter(file_path):
    """Extract title and description from MDX frontmatter"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check for frontmatter
    if not content.startswith('---'):
        return {
            'title': None,
            'description': None,
            'hasFrontmatter': False,
            'missing': ['title', 'description']
        }
    
    # Extract frontmatter block
    match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
    if not match:
        return {
            'title': None,
            'description': None,
            'hasFrontmatter': False,
            'missing': ['title', 'description']
        }
    
    frontmatter_text = match.group(1)
    title = None
    description = None
    
    # Parse YAML-like frontmatter
    for line in frontmatter_text.split('\n'):
        if line.startswith('title:'):
            title = line.replace('title:', '').strip()
            # Remove quotes if present
            title = re.sub(r'^["\']|["\']$', '', title)
        elif line.startswith('description:'):
            description = line.replace('description:', '').strip()
            # Remove quotes if present
            description = re.sub(r'^["\']|["\']$', '', description)
    
    missing = []
    if not title or title == '':
        missing.append('title')
    if not description or description == '':
        missing.append('description')
    
    return {
        'title': title,
        'description': description,
        'hasFrontmatter': True,
        'missing': missing
    }

# Walk all MDX files
all_files = []
for root, dirs, files in os.walk(docs_dir):
    for file in sorted(files):
        if file.endswith('.mdx') or file.endswith('.md'):
            all_files.append(os.path.join(root, file))

# Audit each file
results = []
missing_count = 0
empty_count = 0

for file_path in all_files:
    fm = extract_frontmatter(file_path)
    rel_path = os.path.relpath(file_path, docs_dir)
    
    if fm['missing']:
        missing_count += 1
        if len(fm['missing']) == 2:
            empty_count += 1
    
    results.append({
        'file': rel_path,
        'fullPath': os.path.abspath(file_path),
        **fm
    })

# Print report
print(f"🔍 Frontmatter Audit\n")
print(f"📊 Total MDX files: {len(all_files)}")
print(f"✅ Complete: {len(all_files) - missing_count}")
print(f"⚠️  Missing fields: {missing_count}")
print(f"❌ Empty: {empty_count}\n")

if missing_count > 0:
    print("📝 Files with missing/empty fields:\n")
    for result in results:
        if result['missing']:
            print(f"{result['file']}")
            print(f"  Missing: {', '.join(result['missing'])}")
            if result['title']:
                print(f"  Title: \"{result['title'][:60]}{'...' if len(result['title']) > 60 else ''}\"")
            if result['description']:
                print(f"  Description: \"{result['description'][:60]}{'...' if len(result['description']) > 60 else ''}\"")
            print()

# Save audit data
audit_data = {
    'totalFiles': len(all_files),
    'completeFiles': len(all_files) - missing_count,
    'missingCount': missing_count,
    'emptyCount': empty_count,
    'results': results
}

with open('audit-frontmatter.json', 'w') as f:
    json.dump(audit_data, f, indent=2)

print(f"💾 Audit data saved to: audit-frontmatter.json")
