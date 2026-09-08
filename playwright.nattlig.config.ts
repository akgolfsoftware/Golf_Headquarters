import { defineConfig } from "@playwright/test";

/**
 * Nattlig måling mot PROD (tests/visual/README.md §Nattlig kjøring) — fase 1,
 * økt 6 i «Komplett designport» (05.09.2026).
 *
 * Egen konfig, ikke et prosjekt i playwright.config.ts: `testDir` der er
 * tests/e2e, og `npx playwright test` er prod-røyktesten som kjører etter hver
 * push til main (playwright.yml). Den skal ikke dra med seg 20+ minutter måling.
 *
 * Kjør: npm run nattlig            (krever SCREENTEST_PASSWORD i .env.local)
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "https://akgolf-hq.vercel.app";

export default defineConfig({
  testDir: "tests/visual",
  testMatch: ["*.spec.ts"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Ingen automatiske omkjøringer: en test her tar minutter, og en rød natt
  // skal vises som rød — ikke maskeres av et grønt andreforsøk.
  retries: 0,
  workers: 3,
  timeout: 25 * 60_000,
  expect: { timeout: 10_000 },
  reporter: [["html", { open: "never" }], ["line"]],
  use: { baseURL, trace: "off", screenshot: "off" },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
