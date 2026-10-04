import { defineConfig } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";

assertLocalUsersTargets(process.env);

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  fullyParallel: false,
  forbidOnly: true,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 30_000 },
  reporter: "list",
  outputDir: join(tmpdir(), "ak-hq-local-users-results"),
  use: {
    baseURL: "http://127.0.0.1:3061",
    browserName: "chromium",
    serviceWorkers: "block",
    trace: "off",
    screenshot: "off",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobil", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
