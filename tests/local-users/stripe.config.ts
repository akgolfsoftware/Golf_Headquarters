import { defineConfig } from "@playwright/test";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";
import { assertStripeTestSettings } from "../../scripts/local-stripe-target.mjs";

const targets = assertLocalUsersTargets(process.env);
assertStripeTestSettings({ STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY });
if (process.env.LOCAL_STRIPE_E2E !== "1") throw new Error("Use the dedicated local Stripe runner");
export default defineConfig({
  testDir: "../e2e", testMatch: "booking-drop-in.spec.ts", grep: /^.*Full Stripe-checkout med test-kort 4242$/,
  workers: 1, fullyParallel: false, retries: 0, forbidOnly: true,
  timeout: 180_000, expect: { timeout: 30_000 },
  reporter: [["list"], ["json", { outputFile: join(tmpdir(), "ak-hq-stripe-results.json") }], ["./no-skips-reporter.ts"]],
  outputDir: join(tmpdir(), "ak-hq-stripe-artifacts"),
  use: { baseURL: targets.app.origin, serviceWorkers: "block", trace: "off", screenshot: "off", video: "off", actionTimeout: 30_000 },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }, { name: "webkit", use: { browserName: "webkit" } }],
});
