import { defineConfig } from "@playwright/test";

/**
 * Spillertest (demospillere) mot lokal dev-server. Egen konfig: kjøres bevisst, ikke i CI.
 * Kjør: npm run test:spiller   (krever SCREENTEST_PASSWORD i .env.local)
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "tests/spiller",
  testMatch: ["*.spec.ts"],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45 * 60_000,
  expect: { timeout: 15_000 },
  reporter: [["line"]],
  outputDir: "test-results/spiller",
  use: { baseURL, trace: "off", screenshot: "off" },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
