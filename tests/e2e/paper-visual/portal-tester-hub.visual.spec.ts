import { test, expect } from "@playwright/test";
import path from "node:path";
import { openFasitFile, PAPER_VIEWPORTS, type PaperTema } from "../_paper-fasit-helpers";
const FASIT = path.resolve(__dirname, "../../../designsystem/paper/fase2/playerhq/playerhq-tester-hub.html");
const ER_SEED = process.env.PAPER_SEED === "1";
const CASES: Array<{ viewport: keyof typeof PAPER_VIEWPORTS; tema: PaperTema }> = [
  { viewport: "mobil", tema: "light" }, { viewport: "mobil", tema: "dark" },
  { viewport: "desktop", tema: "light" }, { viewport: "desktop", tema: "dark" },
];
for (const { viewport, tema } of CASES) {
  const snapshotName = `portal-tester-hub-${viewport}-${tema}.png`;
  test(`portal tester-hub ${viewport} ${tema}`, async ({ page }) => {
    await page.setViewportSize(PAPER_VIEWPORTS[viewport]);
    test.skip(!ER_SEED, "seed-only");
    await openFasitFile(page, FASIT);
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), tema);
    await page.addStyleTag({ content: ".state-switch { display: none !important; }" });
    await expect(page.locator(".phone, #kropp, body").first()).toHaveScreenshot(snapshotName, { maxDiffPixelRatio: 0.04 });
  });
}
