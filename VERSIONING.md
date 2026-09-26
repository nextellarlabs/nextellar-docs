# Documentation Versioning Guide

This guide explains how to create and manage versioned documentation snapshots for Nextellar docs releases.

## Overview

The docs site supports multiple versions, allowing readers to view documentation for any previously released version of Nextellar. This prevents "version chasing" where readers see breaking changes in the "latest" docs that don't apply to the version they're using.

### Architecture

- **Current/Next docs**: `/docs/current/...` (unversioned, always points to latest development)
  - These are the docs in the `/docs` directory
  - Updated continuously as the project evolves
  - Readers see these by default

- **Versioned docs**: `/docs/v1.0.0/...`, `/docs/v1.1.0/...`, etc.
  - Frozen snapshots created at release time
  - Located in `/docs/versions/v{VERSION}/...`
  - Never change after creation
  - Linked from the version switcher dropdown in the docs header

### URL Scheme

```
/docs/current/getting-started/introduction       # Current (next) version
/docs/v1.0.0/getting-started/introduction        # Specific released version
```

The version switcher in the header allows readers to switch between versions and navigate to the equivalent page in any other version.

## Creating a Version Snapshot

### Step 1: Prepare Your Release

Before creating a snapshot, ensure:
- All release changes are merged to main
- Package version is bumped in `package.json`
- Release notes are finalized
- Ready to tag the release

### Step 2: Create the Snapshot

Run the snapshot script with your version:

```bash
node scripts/create-version-snapshot.cjs 1.0.0
```

**Arguments:**
- `<version>` (required): Semantic version without the 'v' prefix (e.g., `1.0.0`, `1.2.3-beta`)
- `--git-tag` (optional): Automatically creates a git tag (e.g., `v1.0.0`)

**Examples:**

```bash
# Create snapshot and manually tag later
node scripts/create-version-snapshot.cjs 1.0.0

# Create snapshot and auto-tag in one step
node scripts/create-version-snapshot.cjs 1.0.0 --git-tag

# Beta/prerelease versions
node scripts/create-version-snapshot.cjs 1.0.0-beta.1 --git-tag
```

### Step 3: Verify the Snapshot

The script will:
- ✓ Copy all docs from `/docs` to `/docs/versions/v{VERSION}/docs`
- ✓ Create/update `/docs/versions.json` with metadata
- ✓ Optionally create a git tag

After running, verify:

```bash
# Check that the snapshot was created
ls -la docs/versions/v1.0.0/

# Check that versions.json was updated
cat docs/versions.json
```

Expected output in `docs/versions.json`:

```json
[
  {
    "version": "1.0.0",
    "released": "2024-09-24T12:00:00.000Z",
    "label": "v1.0.0",
    "path": "/docs/v1.0.0"
  }
]
```

### Step 4: Build and Test Locally

Rebuild the docs to ensure everything works:

```bash
npm run build
npm run dev
```

Then manually test:
1. Navigate to `/docs/current/getting-started/introduction`
2. Open the version switcher dropdown in the header
3. Verify "Next" (current) and "v1.0.0" are listed
4. Click "v1.0.0" and confirm you navigate to `/docs/v1.0.0/getting-started/introduction`
5. Repeat for a few other pages to confirm cross-version navigation works

### Step 5: Commit and Push

After verifying:

```bash
# Stage the versioned snapshot and metadata
git add docs/versions/ docs/versions.json

# Commit with a descriptive message
git commit -m "docs: snapshot v1.0.0 at release"

# If you didn't use --git-tag, tag now
git tag v1.0.0

# Push commits and tags
git push origin main
git push origin v1.0.0
```

## How Versioning Works

### Contentlayer Configuration

The `/contentlayer.config.ts` file includes a `VersionedPost` document type that processes docs from:

```
docs/versions/v*/.../*.mdx
```

This allows Contentlayer to discover and build versioned docs alongside current docs.

### URL Routing

The docs routing is at `/src/app/docs/[version]/[...slug]/page.tsx`:

- **Dynamic segment `[version]`**: matches either `current` or `v1.0.0`, `v1.1.0`, etc.
- **Dynamic segment `[...slug]`**: captures the page path within that version

Example paths:
- `/docs/current/cli/overview` → renders current docs
- `/docs/v1.0.0/cli/overview` → renders v1.0.0 snapshot

### Version Switcher Component

Located at `/src/components/version-switcher.tsx`:

- Loads available versions from `/docs/versions.json`
- Detects current page and version from URL
- Renders a dropdown with "Next" (current) and all released versions
- When switching versions, navigates to the same page slug in the new version
- Falls back to version index if page doesn't exist in target version

## Managing Versions

### Listing Available Versions

Check `/docs/versions.json`:

```bash
cat docs/versions.json
```

Versions are sorted newest first. Example:

```json
[
  {
    "version": "1.1.0",
    "released": "2024-10-15T10:00:00.000Z",
    "label": "v1.1.0",
    "path": "/docs/v1.1.0"
  },
  {
    "version": "1.0.0",
    "released": "2024-09-24T12:00:00.000Z",
    "label": "v1.0.0",
    "path": "/docs/v1.0.0"
  }
]
```

### Updating Version Metadata (Manual)

If you need to edit `/docs/versions.json` directly (rare):

```json
{
  "version": "1.0.0",
  "released": "2024-09-24T12:00:00.000Z",
  "label": "v1.0.0",
  "path": "/docs/v1.0.0"
}
```

Fields:
- `version`: semver string (e.g., "1.0.0") — used for comparison
- `released`: ISO 8601 timestamp — when the version was released
- `label`: display string (e.g., "v1.0.0") — shown in the switcher dropdown
- `path`: URL path (e.g., "/docs/v1.0.0") — where this version is served

### Removing a Version

If you need to remove a version:

```bash
# Delete the versioned docs directory
rm -rf docs/versions/v1.0.0

# Remove the entry from docs/versions.json
# (edit manually or via your favorite editor)

# Commit
git add docs/versions.json
git commit -m "docs: remove v1.0.0"
```

## Troubleshooting

### Build fails after creating snapshot

**Symptom**: `npm run build` fails with Contentlayer errors

**Cause**: Versioned docs might have frontmatter issues or invalid MDX

**Solution**:
1. Check the error message for file path
2. Verify the file exists in `docs/versions/v{VERSION}/`
3. Ensure frontmatter has required `title` field
4. Fix the file and rebuild

### Version switcher shows no versions

**Symptom**: Dropdown is empty or says "Loading versions..."

**Cause**: `/docs/versions.json` doesn't exist or is malformed

**Solution**:
1. Check if file exists: `ls docs/versions.json`
2. If not, create it: `echo "[]" > docs/versions.json`
3. Verify JSON is valid: `node -e "console.log(JSON.parse(require('fs').readFileSync('docs/versions.json')))"`

### Can't navigate between versions

**Symptom**: Clicking a version in the switcher doesn't work or 404s

**Cause**: Page doesn't exist in target version, or URL format is wrong

**Solution**:
1. Verify the page exists in the target version directory
2. Check URL format: `/docs/v{VERSION}/{SLUG}` (not `/docs/{VERSION}/...`)
3. If page truly doesn't exist in that version, switcher should fall back to version index

### Old URLs (e.g., `/docs/getting-started/intro`) don't work

**Symptom**: Links to unversioned docs now 404

**Cause**: Old URL format changed from `/docs/{slug}` to `/docs/current/{slug}`

**Solution**:
- The `/docs/[...slug]` route redirects to `/docs/current/[...slug]` automatically
- If redirect isn't working, check that old route handler exists
- Update external links to use `/docs/current/` prefix

## CI/CD Integration (Future Enhancement)

To automate snapshot creation on every release, you could add a GitHub Actions workflow (example):

```yaml
name: Create Docs Version Snapshot

on:
  push:
    tags:
      - 'v*'

jobs:
  snapshot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - name: Create snapshot
        run: node scripts/create-version-snapshot.cjs ${{ github.ref_name }} --git-tag
      - name: Commit snapshot
        run: |
          git add docs/versions/ docs/versions.json
          git commit -m "docs: snapshot ${{ github.ref_name }}"
          git push origin main
```

This would run whenever a tag like `v1.0.0` is pushed, automatically creating the snapshot.

## Related Files

- `/scripts/create-version-snapshot.cjs` — Snapshot creation script
- `/src/lib/versions.ts` — Version utility functions
- `/src/components/version-switcher.tsx` — Version selector UI component
- `/contentlayer.config.ts` — Content layer config (includes VersionedPost type)
- `/src/app/docs/[version]/[...slug]/page.tsx` — Dynamic route handler

## Questions?

For issues or questions about versioning:
1. Check this guide's troubleshooting section
2. Review the snapshot script output for errors
3. Open an issue on GitHub with details about what you're trying to do
