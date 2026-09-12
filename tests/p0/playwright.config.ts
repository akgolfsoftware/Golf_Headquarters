import { defineConfig, devices } from "@playwright/test";
import { krevHqP0AppUrl } from "../../src/lib/launch/p0-hq-supabase";

const baseURL = krevHqP0AppUrl(process.env.P0_HQ_APP_URL ?? process.env.PLAYWRIGHT_BASE_URL).toString().replace(/\/$/, "");

export default defineConfig({
  testDir: ".",
  testMatch: ["*.spec.ts"],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 180_000,
  reporter: [["line"]],
  expect: { timeout: 20_000 },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: 90_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
