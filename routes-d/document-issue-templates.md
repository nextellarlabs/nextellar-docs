Issue Templates Reference — Working Draft
Issue: document-issue-templates
Target page: `docs/guides/issue-templates.mdx`
---
Summary
Documents all available issue templates in the `issues/` directory, when to choose each one, and links from the contributing docs.
Templates Identified
#	File	Type	Complexity
01	`01-remove-unavailable-component-links-from-sidebar.md`	Documentation Cleanup	Easy
02	`02-clean-up-stale-component-page-references.md`	Documentation Cleanup	Easy
03	`03-fix-encoding-corruption-in-readme.md`	Documentation Bug Fix	Easy
04	`04-fix-encoding-corruption-in-hooks-docs.md`	Documentation Bug Fix	Medium
05	`05-fix-encoding-corruption-in-integrations-docs.md`	Documentation Bug Fix	Medium
06	`06-fix-encoding-corruption-in-components-docs.md`	Documentation Bug Fix	Medium
07	`07-fix-encoding-corruption-in-getting-started-and-index-pages.md`	Documentation Bug Fix	Medium
08	`08-document-doctor-command.md`	Documentation Feature	Easy
09	`09-document-add-command.md`	Documentation Feature	Medium
10	`10-document-add-feature-catalog.md`	Documentation Feature	Medium
11	`11-document-telemetry-command-and-flags.md`	Documentation Feature	Easy
12	`12-document-upgrade-command.md`	Documentation Feature	Easy
13	`13-document-deploy-command.md`	Documentation Feature	Easy
14	`14-rewrite-template-docs-for-current-cli-support.md`	Documentation Bug Fix	Medium
15	`15-document-current-scaffold-flags.md`	Documentation Feature	Medium
16	`16-update-cli-docs-for-interactive-prompting.md`	Documentation Bug Fix	Easy
Three Template Categories
Documentation Cleanup
Issues 01–02. Use for removing dead links, stale references, or outdated navigation entries. No new content is created — only existing content is corrected or removed.
Documentation Bug Fix
Issues 03–07, 14, 16. Use for correcting existing content — encoding corruption, broken output, or CLI docs that no longer match the real command surface. Content exists but is wrong.
Documentation Feature
Issues 08–13, 15. Use for adding net-new documentation that does not yet exist on the site — new commands, options, or workflows.
Validation Steps
[ ] `pnpm build:content` passes with no errors
[ ] `pnpm check:links` passes with no broken links
[ ] Link from `docs/guides/contributing.mdx` added
[ ] Page renders in `pnpm dev`