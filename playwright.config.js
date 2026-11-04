import { defineConfig } from '@playwright/test';
export default defineConfig({
  webServer: process.env.DECK_URL ? undefined : {
    command: 'python3 -m http.server 8890 --bind 127.0.0.1',
    url: 'http://127.0.0.1:8890/example.html',
    reuseExistingServer: !process.env.CI,
  },
  testDir: './tests',
  use: { baseURL: process.env.DECK_URL || 'http://127.0.0.1:8890/example.html' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }, { name: 'webkit', use: { browserName: 'webkit' } }],
});
