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
    // Paper-visuelle tester er et LOKALT verktøy for designporten: de
    // sammenligner mot referansebilder som er gitignorert (og bare finnes for
    // -darwin), og flere av dem krever innlogget spiller. I CI finnes verken
    // bildene eller credentials. 06.–15.08.2026 sto prod-røyktesten rød i 195
    // kjøringer på rad fordi ÉN slik spec manglet skip-vakten sin — signalet
    // «produksjon er ødelagt» ble dermed verdiløst. Denne linja gjør det
    // strukturelt umulig å gjenta, uavhengig av vakter i den enkelte fila.
    ...(isCI ? ["**/paper-visual/**"] : []),
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
