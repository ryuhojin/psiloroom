import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "NODE_ENV=test PORT=4100 pnpm --filter admin-api start:dev",
      url: "http://127.0.0.1:4100/api/admin/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "NODE_ENV=test PORT=4101 pnpm --filter user-api start:dev",
      url: "http://127.0.0.1:4101/api/user/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "ADMIN_API_BASE_URL=http://127.0.0.1:4100/api/admin NEXT_DIST_DIR=.next-e2e PORT=3100 pnpm exec next dev --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100/login",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      cwd: "./apps/admin-web",
    },
    {
      command: "USER_API_BASE_URL=http://127.0.0.1:4101/api/user NEXT_DIST_DIR=.next-e2e PORT=3101 pnpm exec next dev --hostname 127.0.0.1 --port 3101",
      url: "http://127.0.0.1:3101/login",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      cwd: "./apps/user-web",
    },
  ],
});
