import { defineConfig } from "@playwright/test";

const productionPatSmoke = process.env.PAT_E2E_PRODUCTION === "1";

export default defineConfig({
  testDir: "./e2e",
  timeout: productionPatSmoke ? 300_000 : 30_000,
  expect: { timeout: productionPatSmoke ? 60_000 : 10_000 },
  fullyParallel: !productionPatSmoke,
  retries: 1,
  workers: productionPatSmoke ? 1 : "50%",
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: productionPatSmoke ? "npm run start" : "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: productionPatSmoke ? 60_000 : 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium", channel: "chrome" },
    },
  ],
  snapshotDir: "./e2e/__snapshots__",
  updateSnapshots: process.env.CI ? "none" : "missing",
});
