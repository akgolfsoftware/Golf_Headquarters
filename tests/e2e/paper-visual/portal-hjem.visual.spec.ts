/**
 * Visuell diff: bygget `/portal` mot Paper-fasiten playerhq-chat-*.html.
 * Mønster: se portal-analysere.visual.spec.ts + GROK-BUILD-BRIEF §4.
 *
 * Merk mobil: `playerhq-chat-mobil.html` wrapper hele UI i `.phone[data-demo-only]`.
 * prepareFasitState skjuler data-demo-only — derfor seed-er vi mobil mot
 * `.phone` med bare `.state-switch` skjult, ikke hele demo-wrapperen.
 */
import { test, expect } from "@playwright/test";
import path from "node:path";
import {
  openFasitFile,
  prepareFasitState,
  fasitInnholdLocator,
  PAPER_VIEWPORTS,
  type PaperTema,
} from "../_paper-fasit-helpers";
import { playerCredentials, dismissCookieBanner } from "../_auth-helpers";

const FASIT_DESKTOP = path.resolve(
  __dirname,
  "../../../designsystem/paper/fase1/playerhq-chat-desktop.html",
);
const FASIT_MOBIL = path.resolve(
  __dirname,
  "../../../designsystem/paper/fase1/playerhq-chat-mobil.html",
);
const BUILT_ROUTE = "/portal";
const BUILT_CONTENT_SELECTOR = "[data-paper-portal-hjem]";
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
    test.skip(true, "mangler spiller-credentials for pixel-diff mot bygget rute");
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
  const snapshotName = `portal-hjem-${viewport}-${tema}.png`;

  test(`portal hjem ${viewport} ${tema} matcher Paper-fasit`, async ({ page }) => {
    await page.setViewportSize(PAPER_VIEWPORTS[viewport]);

    if (ER_SEED) {
      if (viewport === "mobil") {
        await openFasitFile(page, FASIT_MOBIL);
        await page.evaluate((t) => {
          document.documentElement.setAttribute("data-theme", t);
        }, tema);
        await page.addStyleTag({
          content: ".state-switch { display: none !important; }",
        });
        const phone = page.locator(".phone").first();
        await expect(phone).toHaveScreenshot(snapshotName, {
          maxDiffPixelRatio: 0.04,
        });
        return;
      }

      await openFasitFile(page, FASIT_DESKTOP);
      await prepareFasitState(page, { tema });
      const innhold = await fasitInnholdLocator(page);
      await expect(innhold).toHaveScreenshot(snapshotName, {
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
    const bygdInnhold = page.locator(BUILT_CONTENT_SELECTOR).first();
    await expect(bygdInnhold).toHaveScreenshot(snapshotName, {
      maxDiffPixelRatio: 0.04,
    });
  });
}
