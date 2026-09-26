import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
});
dom.window.SVGElement.prototype.getBBox = function () {
  return {
    x: 0,
    y: 0,
    width: (this.textContent?.length || 1) * 8,
    height: 16,
  };
};
dom.window.SVGElement.prototype.getComputedTextLength = function () {
  return (this.textContent?.length || 1) * 8;
};
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  DOMParser: dom.window.DOMParser,
  Element: dom.window.Element,
  HTMLElement: dom.window.HTMLElement,
  SVGElement: dom.window.SVGElement,
  getComputedStyle: dom.window.getComputedStyle,
});

const { default: mermaid } = await import('mermaid');
mermaid.initialize({ startOnLoad: false, theme: 'dark' });

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await markdownFiles(path)));
    } else if (['.md', '.mdx'].includes(extname(entry.name))) {
      files.push(path);
    }
  }

  return files;
}

const diagramFence = /^ {0,3}(`{3,}|~{3,})[\t ]*mermaid(?:[\t ].*)?$/i;
const closingFence = /^ {0,3}(`+|~+)[\t ]*$/;
let diagramCount = 0;
const failures = [];

for (const file of await markdownFiles('docs')) {
  const lines = (await readFile(file, 'utf8')).split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const opening = lines[lineIndex].match(diagramFence);
    if (!opening) continue;

    const openingLine = lineIndex + 1;
    const fence = opening[1];
    const sourceLines = [];
    let closed = false;
    for (lineIndex += 1; lineIndex < lines.length; lineIndex += 1) {
      const closing = lines[lineIndex].match(closingFence);
      if (
        closing &&
        closing[1][0] === fence[0] &&
        closing[1].length >= fence.length
      ) {
        closed = true;
        break;
      }
      sourceLines.push(lines[lineIndex]);
    }

    const location = `${file}:${openingLine}`;
    if (!closed) {
      failures.push(`${location}: Mermaid code fence is not closed`);
      continue;
    }

    diagramCount += 1;
    try {
      const { svg } = await mermaid.render(
        `mermaid-check-${diagramCount}`,
        sourceLines.join('\n')
      );
      if (!svg.includes('<svg')) {
        throw new Error('Mermaid did not produce an SVG');
      }
    } catch (error) {
      failures.push(
        `${location}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${diagramCount} Mermaid diagram${diagramCount === 1 ? '' : 's'}.`
  );
}
