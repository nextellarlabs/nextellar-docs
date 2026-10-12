import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

async function findAvailablePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = server.address();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  return port;
}

async function waitForServer(baseUrl, server) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js server exited with code ${server.exitCode}`);
    }
    try {
      await fetch(baseUrl);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Next.js server did not become ready within 30 seconds');
}

async function assertPage(baseUrl, pathname, expectedText) {
  const response = await fetch(new URL(pathname, baseUrl));
  assert.equal(response.status, 200, `${pathname} should return HTTP 200`);
  const html = await response.text();
  assert.ok(
    html.includes(expectedText),
    `${pathname} should render expected content: ${expectedText}`
  );
}

const port = await findAvailablePort();
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn(
  process.execPath,
  [
    'node_modules/next/dist/bin/next',
    'start',
    '--hostname',
    '127.0.0.1',
    '--port',
    String(port),
  ],
  { stdio: ['ignore', 'pipe', 'pipe'] }
);
let serverOutput = '';
server.stdout.on('data', (chunk) => (serverOutput += chunk));
server.stderr.on('data', (chunk) => (serverOutput += chunk));

try {
  await waitForServer(baseUrl, server);

  await assertPage(baseUrl, '/docs/getting-started/introduction', 'Welcome to');
  await assertPage(
    baseUrl,
    '/docs/cli/overview',
    'The Nextellar CLI is a powerful command-line tool'
  );
  await assertPage(
    baseUrl,
    '/docs/guides/transaction-lifecycle',
    'Every change to Stellar network state'
  );

  console.log('Docs smoke test passed: introduction, CLI overview, and guide.');
} catch (error) {
  if (serverOutput) console.error(serverOutput);
  throw error;
} finally {
  server.kill('SIGTERM');
}
