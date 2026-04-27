# Requirements Document

## Introduction

The Nextellar CLI supports an `add` command that allows developers to incrementally add pre-built feature modules to an existing Nextellar project. Currently, the documentation site does not describe which features are available via `nextellar add`, what each feature provides, or how to use the command. This feature adds a Feature Catalog section to the CLI documentation — covering all supported features (`wallet`, `balances`, `payments`, `history`, `trustlines`, `defi`, `contracts`), their purpose, and example usage — so developers can discover and use the `add` command effectively.

## Glossary

- **CLI**: The Nextellar command-line interface (`nextellar`).
- **Add_Command**: The `nextellar add <feature>` CLI sub-command used to scaffold a feature module into an existing project.
- **Feature**: A named, installable module available through the Add_Command (e.g., `wallet`, `balances`).
- **Feature_Catalog**: The documentation section listing all supported Features with descriptions and examples.
- **Commands_Page**: The documentation page at `docs/cli/commands.mdx`.
- **Overview_Page**: The documentation page at `docs/cli/overview.mdx`.
- **Feature_Name**: The exact string identifier used in the CLI source (e.g., `wallet`, `balances`, `payments`, `history`, `trustlines`, `defi`, `contracts`).

## Requirements

### Requirement 1: Document the `add` Command

**User Story:** As a developer, I want to find the `nextellar add` command documented on the CLI Commands page, so that I know the command exists and understand its syntax.

#### Acceptance Criteria

1. THE Commands_Page SHALL include a dedicated section for the Add_Command.
2. THE Commands_Page SHALL document the Add_Command syntax as `nextellar add <feature>`.
3. THE Commands_Page SHALL list the `<feature>` argument as required with a description stating it is the Feature_Name to scaffold.
4. WHEN a developer reads the Add_Command section, THE Commands_Page SHALL provide at least one usage example using a real Feature_Name from the Feature_Catalog.

---

### Requirement 2: Provide a Feature Catalog

**User Story:** As a developer, I want to see all available features listed in one place, so that I can discover what the `add` command supports without reading source code.

#### Acceptance Criteria

1. THE Commands_Page SHALL include a Feature_Catalog section listing all seven supported features: `wallet`, `balances`, `payments`, `history`, `trustlines`, `defi`, and `contracts`.
2. THE Feature_Catalog SHALL display each Feature_Name using its exact string as it appears in the CLI source.
3. THE Feature_Catalog SHALL provide a short description (one to two sentences) for each Feature explaining what it scaffolds into the project.
4. THE Feature_Catalog SHALL present the features in a structured format (table or definition list) that allows a developer to scan all features at a glance.

---

### Requirement 3: Provide Per-Feature Example Commands

**User Story:** As a developer, I want to see a concrete example command for each feature, so that I can copy and run the correct command without guessing the syntax.

#### Acceptance Criteria

1. THE Feature_Catalog SHALL include at least one example `nextellar add` command for each of the seven features.
2. WHEN an example command is shown, THE Commands_Page SHALL use the exact Feature_Name string from the CLI source (e.g., `nextellar add wallet`, not `nextellar add Wallet`).
3. THE Commands_Page SHALL group examples in a way that associates each example with its corresponding feature description.

---

### Requirement 4: Reference the Feature Catalog from the Overview Page

**User Story:** As a developer reading the CLI Overview, I want a link or mention of the `add` command and Feature Catalog, so that I can navigate to the full reference without searching.

#### Acceptance Criteria

1. THE Overview_Page SHALL include a reference to the Add_Command in the "Command Structure" or equivalent section.
2. THE Overview_Page SHALL include a navigation link to the Feature_Catalog section on the Commands_Page.
3. WHEN the Overview_Page lists common workflows, THE Overview_Page SHALL include at least one workflow example that uses the Add_Command with a real Feature_Name.

---

### Requirement 5: Accuracy and Consistency with CLI Source

**User Story:** As a developer, I want the documented feature names to match the actual CLI source, so that commands I copy from the docs work without modification.

#### Acceptance Criteria

1. THE Feature_Catalog SHALL use Feature_Names that exactly match the identifiers defined in `nextellar/src/lib/features.ts`.
2. IF a Feature_Name in the documentation does not match the CLI source, THEN THE Commands_Page SHALL be considered non-compliant and require correction.
3. THE Commands_Page SHALL not document features that do not exist in the CLI source.
