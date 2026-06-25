---
title: "Hint: Discovering CLI Commands via the Help Flag"
description: How to use the --help flag to explore Nextellar CLI commands and subcommand options
---

# Discovering CLI Commands via the Help Flag

Every Nextellar CLI command and subcommand accepts a `--help` (or `-h`) flag that prints a usage summary directly in your terminal.

---

## Top-Level Help

```bash
nextellar --help
```

This prints the full list of top-level commands, global flags, and a short description of each.

---

## Subcommand Help

Pass `--help` after any subcommand to see its specific options:

```bash
nextellar add --help
nextellar deploy --help
nextellar init --help
```

Each subcommand's help output includes its accepted flags, required arguments, and brief usage examples.

---

## Notes

- `--help` never modifies any files or runs any side effects — it is safe to run at any time.
- If a command is not behaving as expected, running it with `--help` is a good first step before consulting the full reference.

**Related:** `--version`, [CLI Flags & Options](/docs/cli/flags), [CLI Commands](/docs/cli/commands)
