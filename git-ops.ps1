#!/usr/bin/env pwsh

# Step 1: Stage the file
Write-Host "Step 1: Staging file..." -ForegroundColor Green
git add docs/guides/contributing.mdx
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ File staged successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to stage file" -ForegroundColor Red
    exit 1
}

# Step 2: Create commit
Write-Host "`nStep 2: Creating commit..." -ForegroundColor Green
git commit -m "docs(contributing): document check:links and validate:sidebar usage

Adds comprehensive documentation for both validation scripts to the contributing guide:

- check:links: Validates all internal links in documentation files against actual routes and anchors
- validate:sidebar: Validates component links in sidebar.tsx and toc.tsx match actual component files

Includes purpose, commands, example outputs, failure cases, and troubleshooting steps.

Closes #1162"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Commit created successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to create commit" -ForegroundColor Red
    exit 1
}

# Step 3: Push to remote
Write-Host "`nStep 3: Pushing to remote..." -ForegroundColor Green
git push -u origin docs/contributing-validators

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Push successful" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to push" -ForegroundColor Red
    exit 1
}

Write-Host "`nAll operations completed successfully!" -ForegroundColor Green
