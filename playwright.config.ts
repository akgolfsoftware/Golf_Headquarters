import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const isCI = !!process.env.CI;

export default defineConfig({
  // Én e2e-mappe siden 2026-08-03 — gamle `e2e/` er slått inn i `tests/e2e/`.
  testDir: "tests/e2e",
  testMatch: ["*.spec.ts"],
  testIgnore: [
    "**/node_modules/**",
    "**/.next/**",
    "**/.vercel/**",
    "**/_arkiv/**",
    // Lærdom 06.–15.08.2026: prod-røyktesten sto rød i 195 kjøringer fordi én
    // lokal snapshot-spec (paper-visual, slettet 05.09.2026) manglet skip-vakt.
    // Regel: tester som trenger credentials eller gitignorerte referansebilder
    // hører ALDRI hjemme under tests/e2e/ — de ligger i tests/visual/ og
    // kjører ikke i CI.
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
