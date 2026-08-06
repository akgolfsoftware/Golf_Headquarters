import { test, expect } from "@playwright/test";
import path from "node:path";
import { openFasitFile, PAPER_VIEWPORTS, type PaperTema } from "../_paper-fasit-helpers";
import { playerCredentials, dismissCookieBanner } from "../_auth-helpers";

const FASIT = path.resolve(__dirname, "../../../designsystem/paper/fase1/playerhq-meg.html");
const BUILT_ROUTE = "/portal/meg";
const BUILT_CONTENT_SELECTOR = "[data-paper-portal-meg]";
const ER_SEED = process.env.PAPER_SEED === "1";

const CASES: Array<{ viewport: keyof typeof PAPER_VIEWPORTS; tema: PaperTema }> = [
  { viewport: "mobil", tema: "light" },
  { viewport: "mobil", tema: "dark" },
  { viewport: "desktop", tema: "light" },
  { viewport: "desktop", tema: "dark" },
];

async function loginIfNeeded(page: import("@playwright/test").Page) {
  const creds = playerCredentials();
  if (!creds) {
    test.skip(true, "mangler spiller-credentials");
    return;
  }
  await page.goto("/auth/login");
  await dismissCookieBanner(page);
  await page.locator('input[type="email"]').fill(creds.email);
  await page.locator('input[type="password"]').fill(creds.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(portal|auth\/etter-innlogging)/, { timeout: 30_000 });
}

for (const { viewport, tema } of CASES) {
  const snapshotName = `portal-meg-${viewport}-${tema}.png`;
  test(`portal meg ${viewport} ${tema}`, async ({ page }) => {
    await page.setViewportSize(PAPER_VIEWPORTS[viewport]);
    if (ER_SEED) {
      await openFasitFile(page, FASIT);
      await page.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
      }, tema);
      await page.addStyleTag({ content: ".state-switch { display: none !important; }" });
      await expect(page.locator(".phone, #kropp, body").first()).toHaveScreenshot(snapshotName, {
        maxDiffPixelRatio: 0.04,
      });
      return;
    }
    await loginIfNeeded(page);
    await page.goto(BUILT_ROUTE, { waitUntil: "domcontentloaded" });
    await page.evaluate((t) => {
      document.cookie = `ak-v2-tema=${t}; path=/`;
      document.documentElement.setAttribute("data-v2-tema", t);
    }, tema);
    await expect(page.locator(BUILT_CONTENT_SELECTOR).first()).toHaveScreenshot(snapshotName, {
      maxDiffPixelRatio: 0.04,
    });
  });
}
