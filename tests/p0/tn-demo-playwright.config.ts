import { defineConfig, devices } from "@playwright/test";

/**
 * Egen Playwright-konfigurasjon for Team Norway-demoprøven — peker på egen
 * app-port (3011), ikke den delte P0-runnerens 3010. Ingen endring av
 * tests/p0/playwright.config.ts.
 */
function krevTnDemoAppUrl(url: string | undefined): string {
  if (!url) throw new Error("TN_DEMO_APP_URL/PLAYWRIGHT_BASE_URL is required; production defaults are forbidden");
  const target = new URL(url);
  if (target.hostname !== "127.0.0.1") throw new Error("TN_DEMO_APP_URL must be loopback 127.0.0.1");
  if (target.port !== "3011") throw new Error("TN_DEMO_APP_URL must use port 3011");
  return target.toString().replace(/\/$/, "");
}

const baseURL = krevTnDemoAppUrl(process.env.TN_DEMO_APP_URL ?? process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: ".",
  outputDir: "/tmp/ak-hq-tn-demo-playwright-results",
  testMatch: ["team-norway-demo-innlogget.spec.ts"],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 180_000,
  reporter: [["line"]],
  expect: { timeout: 20_000 },
  use: {
    baseURL,
    trace: "off",
    screenshot: "on",
    navigationTimeout: 90_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
