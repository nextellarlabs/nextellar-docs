#!/usr/bin/env pwsh
$ErrorActionPreference = "Stop"

$path = "c:\Users\Nuelthewave\Desktop\NT PR\nextellar-docs"
Set-Location $path

# Stage the changes
git add docs/guides/contributing.mdx

# Create the commit
git commit -m "docs(contributing): document check:links and validate:sidebar usage

Adds comprehensive documentation for both validation scripts to the contributing guide:

- check:links: Validates all internal links in documentation files against actual routes and anchors
- validate:sidebar: Validates component links in sidebar.tsx and toc.tsx match actual component files

Includes purpose, commands, example outputs, failure cases, and troubleshooting steps.

Closes #1162"

Write-Host "✅ Commit created successfully!"
