import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  snapshotPathTemplate: '{testDir}/{testFileName}-snapshots/{arg}{ext}',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    ...devices['Desktop Chrome'],
    browserName: 'chromium',
    colorScheme: 'light',
    locale: 'en-US',
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'visual',
      testDir: './tests/visual',
    },
    {
      name: 'a11y',
      testDir: './tests/a11y',
      retries: isCI ? 2 : 0,
      workers: isCI ? 1 : undefined,
      reporter: 'html',
    },
  ],
  webServer: {
    command: 'pnpm dev --hostname 127.0.0.1',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
