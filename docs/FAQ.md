# Frequently Asked Questions

## General

### What does this project generate?

The CLI scaffolds a new Soroban project with a working directory layout,
configuration files, and CI-ready defaults.

### Which networks are supported?

Both `testnet` and `mainnet` are supported. Testnet is the default for new
projects.

## Configuration

### Why is my environment variable ignored?

Environment variables are read only if they appear in the generated project's
`.env.example` and are consumed by the scaffold. Verify the exact name
(including the `NEXT_PUBLIC_` prefix) against the template.

### What is the correct RPC variable name?

The RPC endpoint variable is `NEXT_PUBLIC_SOROBAN_URL`. Older documentation
referenced `NEXT_PUBLIC_SOROBAN_RPC`, which was never present in any template
and has been removed.

### How do I disable telemetry?

Set `telemetry: false` in `.nextellar/config.json` or pass `--no-telemetry`.

## Troubleshooting

### The scaffold fails with a template error

Check that the selected template exists under `src/templates/` and that its
`.env.example` is present and well-formed.

### Generated links are broken

Run the markdown lint and link checks locally. Broken anchors are usually
caused by renamed headings.

### A documented flag does not exist

The docs may be out of date. Verify the flag in the CLI source and open a
correction if it is missing.

## Contributing

### How do I propose a doc change?

Open an issue describing the gap, then submit a PR that diffs the docs
against `src/lib/` and `src/templates/`.
