import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const cliReferencePath = path.join(repositoryRoot, 'docs/cli/commands.mdx');
const docsRoot = path.join(repositoryRoot, 'docs');

function walkMarkdownFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkMarkdownFiles(entryPath);
    return entry.isFile() && /\.mdx?$/.test(entry.name) ? [entryPath] : [];
  });
}

function countReferences(text, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (text.match(new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, 'gi')) ?? [])
    .length;
}

function extractCommands(reference) {
  const heading = /^## Command Overview[ \t]*\r?\n/m.exec(reference);
  if (!heading)
    throw new Error(
      'Could not find the Command Overview table in docs/cli/commands.mdx'
    );
  const overviewStart = heading.index + heading[0].length;
  const nextHeading = /^##\s/m.exec(reference.slice(overviewStart));
  const overview = reference.slice(
    overviewStart,
    nextHeading ? overviewStart + nextHeading.index : reference.length
  );

  return [
    ...overview.matchAll(
      /^\|[ \t]*`(nextellar(?:[ \t]+[a-z][a-z-]*)?)`[ \t]*\|/gm
    ),
  ].map(([, command]) => command);
}

function createReport(reference, docsCorpus) {
  const commands = extractCommands(reference);
  const flags = [
    ...new Set(reference.match(/--[a-z][a-z0-9-]*/g) ?? []),
  ].sort();
  const commandCoverage = commands.map((command) => ({
    name: command,
    references: countReferences(docsCorpus, command),
  }));
  const flagCoverage = flags.map((flag) => ({
    name: flag,
    references: countReferences(docsCorpus, flag),
  }));
  const gaps = [
    ...commandCoverage
      .filter(({ references }) => references === 0)
      .map(({ name }) => `command \`${name}\``),
    ...flagCoverage
      .filter(({ references }) => references === 0)
      .map(({ name }) => `option \`${name}\``),
  ];
  const coveredCommands =
    commandCoverage.length -
    commandCoverage.filter(({ references }) => references === 0).length;
  const coveredFlags =
    flagCoverage.length -
    flagCoverage.filter(({ references }) => references === 0).length;

  const lines = [
    '# CLI Documentation Coverage',
    '',
    `Surface source: [docs/cli/commands.mdx](docs/cli/commands.mdx)`,
    `Commands covered: ${coveredCommands}/${commandCoverage.length}`,
    `Options covered: ${coveredFlags}/${flagCoverage.length}`,
    '',
    '## Commands',
    '',
    '| CLI command | Other docs references |',
    '| --- | ---: |',
    ...commandCoverage.map(
      ({ name, references }) => `| \`${name}\` | ${references} |`
    ),
    '',
    '## Options',
    '',
    '| CLI option | Other docs references |',
    '| --- | ---: |',
    ...flagCoverage.map(
      ({ name, references }) => `| \`${name}\` | ${references} |`
    ),
    '',
    '## Gaps',
    '',
    ...(gaps.length > 0
      ? gaps.map((gap) => `- No reference found for ${gap}.`)
      : ['No uncovered commands or options.']),
  ];

  return lines.join('\n');
}

const reference = fs.readFileSync(cliReferencePath, 'utf8');
const docsCorpus = walkMarkdownFiles(docsRoot)
  .filter((filePath) => filePath !== cliReferencePath)
  .map((filePath) => fs.readFileSync(filePath, 'utf8'))
  .join('\n');
const report = createReport(reference, docsCorpus);

console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`);
}
