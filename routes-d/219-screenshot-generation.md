# Issue #219 — Add automated screenshot generation for component docs

Working draft / decision record. Lives outside `docs/` so it does not affect the
Contentlayer build. Scope is documentation only.

## Planned doc location

- `docs/guides/screenshot-workflow.mdx` (new file)

## Scope

- Design the screenshot workflow using Playwright
- Document how to run the script
- Define storage path and naming conventions
- Verify generated assets render in docs

## Workflow design

### Tool choice

Playwright is already a common choice in Next.js documentation projects. It can
drive a headless browser against the local dev server and capture each component
in a consistent viewport.

### Script location

```
scripts/screenshot-components.ts
```

### Storage convention

Generated screenshots are saved to:

```
public/screenshots/<component-slug>/<variant>.png
```

Examples:

- `public/screenshots/button/primary-xs.png`
- `public/screenshots/dialog/default.png`
- `public/screenshots/tabs/overview.png`

### Naming rules

- Component slug matches the MDX filename without extension (e.g. `connect-wallet-button`).
- Variant name is kebab-case and describes the state or prop combination captured.
- Width is fixed at `1280px`, height is auto-cropped to the component bounding box.

### Running the script

```bash
# 1. Start the dev server in the background
pnpm dev &

# 2. Run the screenshot script
pnpm screenshot:components

# 3. Commit generated assets
git add public/screenshots
```

Add the npm script to `package.json`:

```json
"screenshot:components": "ts-node scripts/screenshot-components.ts"
```

### Referencing screenshots in MDX

```mdx
![Button primary variant](/screenshots/button/primary-xs.png)
```

## Acceptance criteria

- `pnpm build:content` passes (image references do not affect Contentlayer).
- `pnpm check:links` passes (image paths are local, not link-checked).
- Screenshots render correctly in the local dev server preview.
- Storage path and naming convention documented in `docs/guides/screenshot-workflow.mdx`.
