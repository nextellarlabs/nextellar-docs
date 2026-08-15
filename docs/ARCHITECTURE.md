# Documentation Site Architecture

This document describes how the documentation site is structured and how
content is generated and rendered.

## Content source

The documentation is authored as Markdown and MDX files. MDX allows embedding
React components inside prose, which is used for interactive examples and
custom callouts. Plain Markdown is preferred for reference material.

## Directory layout

```
src/
  templates/        project scaffolding templates (.env.example files live here)
  lib/              CLI + scaffold implementation (source of truth for flags)
  content/          documentation pages (Markdown/MDX)
  components/       MDX components used inside pages
```

## The single-source-of-truth rule

The CLI and scaffold implementation under `src/lib/` and `src/templates/` is
the source of truth for every documented environment variable, flag, and
config key. Documentation must be diffed against these files, not written from
memory. When the implementation changes, the docs must change in the same PR.

## Rendering pipeline

```
Markdown/MDX source
        |
        v
static site generator (build step)
        |
        v
generated HTML (deployable artifact)
```

The build step:

1. Resolves internal links and validates anchors.
2. Compiles MDX into React.
3. Applies syntax highlighting to code fences.
4. Emits a static bundle.

## Environment variable documentation

The `environment-options` reference page is generated from, and must stay in
sync with, the variables actually present in each template's `.env.example`
and in the CLI source. The rules are:

- A variable is documented only if it exists in a template or in the CLI.
- A variable present in the implementation but missing from docs is a gap and
  must be added.
- A variable documented but absent from the implementation is an error and
  must be removed.

## Config file documentation

The `.nextellar/config.json` keys are documented the same way: verify each key
exists in the scaffold code before documenting it. Document the key's type,
default, and effect.

## Adding a page

1. Create the Markdown/MDX file under `src/content/`.
2. Add the page to the navigation/index so it is reachable.
3. Run the markdown lint and link checks locally.
4. Open a PR that includes both the page and any index update.
