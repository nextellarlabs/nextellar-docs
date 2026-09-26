import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const requiredItems = [
  'I ran `pnpm run build` and `pnpm run test:unit`, or documented why a check could not run.',
  'Documentation links and navigation are correct for any documentation changes.',
  'No secrets, credentials, or local environment files are included.',
];

export function validateChecklist(body) {
  const headings = [...body.matchAll(/^##\s+(.+)\s*$/gm)];
  const checklistHeading = headings.find(
    ([, heading]) => heading.trim().toLowerCase() === 'contributor checklist'
  );
  if (!checklistHeading) {
    return { errors: ['Missing the "Contributor checklist" section.'] };
  }

  const sectionStart = checklistHeading.index + checklistHeading[0].length;
  const nextHeading = headings.find(
    (heading) => heading.index > checklistHeading.index
  );
  const section = body.slice(sectionStart, nextHeading?.index ?? body.length);
  const items = new Map(
    [...section.matchAll(/^-\s+\[([ xX])\]\s+(.+)$/gm)].map(
      ([, state, label]) => [label.trim(), state.toLowerCase() === 'x']
    )
  );
  const errors = [];

  for (const requiredItem of requiredItems) {
    if (!items.has(requiredItem)) {
      errors.push(`Missing required checklist item: ${requiredItem}`);
    } else if (!items.get(requiredItem)) {
      errors.push(`Checklist item is incomplete: ${requiredItem}`);
    }
  }

  return { errors };
}

function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is required to validate a pull request.');
    process.exitCode = 1;
    return;
  }

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  const body = event.pull_request?.body ?? '';
  const { errors } = validateChecklist(body);

  if (errors.length > 0) {
    console.error(
      'Complete the contributor checklist before requesting review:'
    );
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log('All required contributor checklist items are complete.');
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main();
}
