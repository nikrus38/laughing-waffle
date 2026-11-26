import path from 'node:path';
import { defineConfig } from '@playwright/test';

// На Windows берём Python из локального venv, в CI — системный.
const python =
  process.env.PYTHON ??
  (process.platform === 'win32' ? path.resolve('.venv/Scripts/python.exe') : 'python');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  projects: [
    { name: 'mobile-390' },
    { name: 'mobile-360', use: { viewport: { width: 360, height: 640 } } },
  ],
  use: {
    baseURL: 'http://127.0.0.1:8010',
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `"${python}" api/manage.py runserver 127.0.0.1:8010 --noreload`,
    url: 'http://127.0.0.1:8010/healthz',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
