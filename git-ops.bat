@echo off
setlocal enabledelayedexpansion

cd /d "c:\Users\Nuelthewave\Desktop\NT PR\nextellar-docs"

echo Step 1: Staging file...
git add docs/guides/contributing.mdx
if !errorlevel! equ 0 (
    echo ✓ File staged successfully
) else (
    echo ✗ Failed to stage file
    exit /b 1
)

echo.
echo Step 2: Creating commit...
git commit -m "docs(contributing): document check:links and validate:sidebar usage

Adds comprehensive documentation for both validation scripts to the contributing guide:

- check:links: Validates all internal links in documentation files against actual routes and anchors
- validate:sidebar: Validates component links in sidebar.tsx and toc.tsx match actual component files

Includes purpose, commands, example outputs, failure cases, and troubleshooting steps.

Closes #1162"

if !errorlevel! equ 0 (
    echo ✓ Commit created successfully
) else (
    echo ✗ Failed to create commit
    exit /b 1
)

echo.
echo Step 3: Pushing to remote...
git push -u origin docs/contributing-validators

if !errorlevel! equ 0 (
    echo ✓ Push successful
) else (
    echo ✗ Failed to push
    exit /b 1
)

echo.
echo All operations completed successfully!
