#!/usr/bin/env node

/**
 * Type-check TS/TSX examples that reference shipped hooks.
 *
 * Usage:
 *   node scripts/verify-hook-examples.mjs --template-src ../nextellar/src/templates/default/src
 *
 * The source root must contain `hooks/` and the generated template's other
 * source directories. Contextual names such as page props are shimmed as `any`;
 * hook imports and their arguments/return values are checked against source.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = path.join(repoRoot, 'docs', 'hooks');

function parseArgs(args) {
  const index = args.indexOf('--template-src');
  return index >= 0 ? args[index + 1] : process.env.NEXTELLAR_TEMPLATE_SRC;
}

const configuredSource = parseArgs(process.argv.slice(2));
const templateSrc = path.resolve(
  repoRoot,
  configuredSource ?? '../nextellar/src/templates/default/src'
);
const hooksDir = path.join(templateSrc, 'hooks');

if (!fs.existsSync(hooksDir)) {
  console.error(
    'Template source not found. Pass --template-src <template>/src or set NEXTELLAR_TEMPLATE_SRC.'
  );
  process.exit(2);
}

const hookFiles = fs
  .readdirSync(hooksDir)
  .filter((file) => /^use[A-Z].*\.tsx?$/.test(file));
const shippedHooks = hookFiles.map((file) => path.basename(file, path.extname(file)));
const codeFence = /```(tsx|ts|jsx|js)\s*\r?\n([\s\S]*?)\r?\n```/g;
const selected = [];

for (const file of fs.readdirSync(docsDir).filter((name) => name.endsWith('.mdx'))) {
  const filePath = path.join(docsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  for (const match of content.matchAll(codeFence)) {
    const code = match[2];
    const mentionedHooks = shippedHooks.filter((name) =>
      new RegExp(`\\b${name}\\b`).test(code)
    );
    const importsHook = /from\s+['"][^'"]*hooks\//.test(code);
    const signatureOnly = mentionedHooks.some((name) =>
      new RegExp(`^\\s*(?:export\\s+)?(?:function\\s+)?${name}\\s*\\([\\s\\S]*?\\)\\s*:\\s*[\\w<>{}|\\[\\].]+;?\\s*$`).test(code)
    );
    const invokesHook = !signatureOnly && mentionedHooks.some((name) =>
      new RegExp(`\\b${name}\\s*\\(`).test(code) &&
      !new RegExp(`(?:function|type)\\s+${name}\\s*\\(`).test(code)
    );
    if (importsHook || invokesHook) {
      selected.push({
        file,
        line: content.slice(0, match.index).split('\n').length,
        language: match[1],
        code,
        mentionedHooks,
      });
    }
  }
}

if (selected.length === 0) {
  console.error(`No hook examples found under ${docsDir}`);
  process.exit(2);
}

const templateRoot = path.resolve(templateSrc, '..', '..', '..', '..');
const tempDir = fs.mkdtempSync(path.join(templateRoot, '.hook-example-check-'));
const files = [];
const contextualNames = new Set([
  'amount',
  'asset',
  'contractId',
  'destination',
  'error',
  'fee',
  'from',
  'myAddress',
  'orderId',
  'publicKey',
  'recipient',
  'sender',
  'signedXDR',
  'transaction',
  'wallet',
  'xdr',
]);

function rewriteAliases(code) {
  return code.replace(/(from\s+['"])@\/([^'"]+)(['"])/g, (_all, before, rest, after) => {
    const target = path.resolve(templateSrc, rest);
    const relative = path.relative(tempDir, target).split(path.sep).join('/');
    return `${before}${relative.startsWith('.') ? relative : `./${relative}`}${after}`;
  });
}

function addHookImports(code, names) {
  const imports = names.filter((name) => {
    const imported = new RegExp(`from\\s+['"][^'"]*${name}['"]`).test(code);
    return !imported;
  });
  const reactHooks = ['useCallback', 'useEffect', 'useMemo', 'useRef', 'useState'];
  const missingReactHooks = reactHooks.filter((name) =>
    new RegExp(`\\b${name}\\b`).test(code) &&
    !new RegExp(`import[^;]*\\b${name}\\b[^;]*from\\s+['"]react['"]`, 's').test(code)
  );
  const prefix = [];
  for (const name of imports) {
    const extension = hookFiles.find((file) => path.basename(file, path.extname(file)) === name);
    if (extension) {
      const modulePath = path.relative(tempDir, path.join(hooksDir, extension)).split(path.sep).join('/');
      prefix.push(`import { ${name} } from '${modulePath.startsWith('.') ? modulePath : `./${modulePath}`}';`);
    }
  }
  if (missingReactHooks.length) {
    prefix.push(`import { ${missingReactHooks.join(', ')} } from 'react';`);
  }
  if (/\bReact\./.test(code) && !/import\s+(?:React|\*\s+as\s+React)/.test(code)) {
    prefix.push("import * as React from 'react';");
  }
  return [...prefix, code].join('\n');
}

function sourceForExample(example, index) {
  let code = rewriteAliases(example.code);
  code = addHookImports(code, example.mentionedHooks);
  const filename = `${String(index + 1).padStart(3, '0')}-${path.basename(example.file, '.mdx')}-${example.line}.tsx`;
  const filePath = path.join(tempDir, filename);
  fs.writeFileSync(filePath, `${code}\n\nexport {};\n`);
  files.push(filePath);
  return filePath;
}

function isBoundInSnippet(name, code) {
  return [
    new RegExp(`\\b(?:const|let|var)\\s+${name}\\b`),
    new RegExp(`\\b(?:const|let|var)\\s+\\{[^}]*\\b${name}\\b`, 's'),
    new RegExp(`\\bcatch\\s*\\(\\s*${name}\\b`),
    new RegExp(`\\bfunction\\s+\\w+\\s*\\([^)]*\\b${name}\\b`),
    new RegExp(`\\bimport\\s+\\{[^}]*\\b${name}\\b`, 's'),
  ].some((pattern) => pattern.test(code));
}

try {
  const sourceFiles = selected.map(sourceForExample);
  const options = {
    allowJs: true,
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    allowImportingTsExtensions: true,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    baseUrl: templateSrc,
    paths: { '@/*': ['*'] },
    noEmit: true,
    skipLibCheck: true,
    strict: false,
    target: ts.ScriptTarget.ES2022,
  };
  let shimmed = new Map();
  let diagnostics = [];

  for (let pass = 0; pass < 8; pass++) {
    for (const file of sourceFiles) {
      const declarations = [...(shimmed.get(file) ?? [])]
        .map((name) => `declare const ${name}: any;`)
        .join('\n');
      const original = selected[sourceFiles.indexOf(file)];
      const code = rewriteAliases(addHookImports(original.code, original.mentionedHooks));
      const contextDeclarations = [...contextualNames]
        .filter((name) =>
          new RegExp(`\\b${name}\\b`).test(code) &&
          !isBoundInSnippet(name, code)
        )
        .map((name) => `declare const ${name}: any;`)
        .join('\n');
      const reactTypes = /\bReact\./.test(code) && !/import\s+(?:React|\*\s+as\s+React)/.test(code)
        ? "import * as React from 'react';\n"
        : '';
      fs.writeFileSync(file, `${reactTypes}${contextDeclarations}\n${declarations}\n${code}\n\nexport {};\n`);
    }

    const program = ts.createProgram(sourceFiles, options);
    diagnostics = ts.getPreEmitDiagnostics(program).filter((diagnostic) =>
      diagnostic.file && sourceFiles.includes(diagnostic.file.fileName)
    );
    const unresolved = new Map();

    for (const diagnostic of diagnostics) {
      if (diagnostic.code !== 2304 || !diagnostic.file || diagnostic.start === undefined) continue;
      const name = diagnostic.messageText.toString().match(/Cannot find name '([^']+)'/)?.[1];
      if (!name || name.startsWith('use') || shippedHooks.includes(name)) continue;
      const names = unresolved.get(diagnostic.file.fileName) ?? new Set();
      names.add(name);
      unresolved.set(diagnostic.file.fileName, names);
    }

    let added = false;
    for (const [file, names] of unresolved) {
      const current = shimmed.get(file) ?? new Set();
      for (const name of names) {
        if (!current.has(name)) {
          current.add(name);
          added = true;
        }
      }
      shimmed.set(file, current);
    }
    if (!added) break;
  }

  console.log(`Checked ${selected.length} hook-related code blocks from ${new Set(selected.map((example) => example.file)).size} hook pages.`);
  if (diagnostics.length) {
    for (const diagnostic of diagnostics) {
      const example = selected[sourceFiles.indexOf(diagnostic.file.fileName)];
      const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0);
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      console.error(`${example.file}:${example.line + position.line}: TS${diagnostic.code} ${message}`);
    }
    process.exitCode = 1;
  } else {
    console.log('All hook-related examples type-check against the supplied template source.');
  }
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}