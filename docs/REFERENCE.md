# Configuration Reference

This page is a reference for the configuration surface exposed by the CLI and
the scaffold. Every value documented here is verified against the
implementation in `src/lib/` and the templates in `src/templates/`.

## Environment variables

Environment variables are read by the CLI and injected into generated
projects. The table below lists the supported variables, their purpose, and
their defaults where a default exists.

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | Application display name | `{{APP_NAME}}` |
| `NEXT_PUBLIC_SOROBAN_URL` | Soroban RPC endpoint | none |
| `NEXT_PUBLIC_NETWORK` | Target network (`testnet` / `mainnet`) | `testnet` |
| `NEXT_PUBLIC_WALLET_CONNECT_ID` | WalletConnect project ID | none |

Variables that appear in a template `.env.example` are the ones a generated
project is expected to populate. Do not document variables that are absent
from every template.

## Config file (`.nextellar/config.json`)

The generated project can be customized through `.nextellar/config.json`.
Supported keys:

| Key | Type | Purpose |
|---|---|---|
| `name` | string | Project name used in generated files |
| `network` | string | Default network for commands |
| `rpcUrl` | string | Override RPC endpoint |
| `telemetry` | boolean | Enable/disable telemetry reporting |

## CLI flags

The CLI exposes the following flags on the `scaffold` command:

| Flag | Description |
|---|---|
| `--name` | Project name |
| `--template` | Template to scaffold from |
| `--network` | Target network |
| `--no-telemetry` | Disable telemetry for this project |

## Telemetry

Telemetry, when enabled, reports non-sensitive usage metadata (command name,
template, network). It never sends secrets or project source. Set
`telemetry: false` in `.nextellar/config.json` or pass `--no-telemetry` to
opt out.

## Notes on accuracy

This reference is generated from the implementation. If a value here does not
match the code, treat the code as the source of truth and open a correction.
