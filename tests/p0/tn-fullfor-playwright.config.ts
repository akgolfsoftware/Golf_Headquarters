import { defineConfig, devices } from "@playwright/test";

/** Egen Playwright-config for tn-fullfor-lokal-reise.mjs — app-port 3012, HELT separat fra 3011-reserven og dens config. */
function krevTnFullforAppUrl(url: string | undefined): string {
  if (!url) throw new Error("PLAYWRIGHT_BASE_URL is required; production defaults are forbidden");
  const target = new URL(url);
  if (target.hostname !== "127.0.0.1") throw new Error("PLAYWRIGHT_BASE_URL must be loopback 127.0.0.1");
  if (target.port !== "3012") throw new Error("PLAYWRIGHT_BASE_URL must use port 3012");
  return target.toString().replace(/\/$/, "");
}

const baseURL = krevTnFullforAppUrl(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: ".",
  outputDir: "/private/tmp/ak-hq-tn-fullfor-20260914/playwright-results",
  testMatch: ["tn-fullfor-testdag-reise.spec.ts"],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 180_000,
  reporter: [["line"]],
  expect: { timeout: 20_000 },
  use: { baseURL, trace: "off", screenshot: "on", navigationTimeout: 90_000 },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
