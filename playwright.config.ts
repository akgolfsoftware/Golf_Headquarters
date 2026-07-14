import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const isCI = !!process.env.CI;

export default defineConfig({
  // Begge mappene scannes — `e2e/` er eldre tester, `tests/e2e/` er ny smoke-suite.
  testDir: ".",
  testMatch: ["e2e/*.spec.ts", "tests/e2e/*.spec.ts"],
  testIgnore: [
    "**/node_modules/**",
    "**/.next/**",
    "**/.vercel/**",
    "**/_arkiv/**",
  ],

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : 4,
  reporter: [["html"], ["line"]],

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  // Auto-start dev-server lokalt (i CI antar vi det allerede kjører eller at vi peker mot Vercel-deploy)
  webServer: isCI
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
