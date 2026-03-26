const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 60 * 1000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'python3 -m http.server 4173',
    cwd: __dirname,
    url: 'http://127.0.0.1:4173/index.html',
    reuseExistingServer: true,
    timeout: 30 * 1000
  }
});
