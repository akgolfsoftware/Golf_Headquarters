/**
 * Visuell diff: bygget `/portal/analysere` mot Paper-fasiten
 * `designsystem/paper/fase1/playerhq-analyse.html`.
 *
 * MØNSTER — kopier denne filen for hver ny skjerm dere vil ha en automatisk
 * pre-sjekk på (se docs/port/GROK-BUILD-BRIEF.md §Verifisering):
 *
 *   1. SEED (kjøres ÉN gang, og på nytt hver gang fasit-filen endrer seg):
 *        PAPER_SEED=1 npx playwright test tests/e2e/paper-visual/portal-analysere.visual.spec.ts --update-snapshots
 *      Dette skjermbilder FASIT-filen (state fjernet for demo-stillas, se
 *      _paper-fasit-helpers.ts) og lagrer den som fasit-baseline i
 *      `portal-analysere.visual.spec.ts-snapshots/`. Commit disse PNG-ene —
 *      de ER referansen fra nå av, ikke den levende Claude Design-filen
 *      (som Grok uansett ikke har MCP-tilgang til).
 *
 *   2. SJEKK (kjøres etter hver kodeendring på skjermen):
 *        npx playwright test tests/e2e/paper-visual/portal-analysere.visual.spec.ts
 *      Skjermbilder den BYGDE ruta og sammenligner pixel-for-pixel mot
 *      baseline fra steg 1. Feiler testen: se
 *      test-results/…/portal-analysere-*-diff.png for et faktisk diff-bilde.
 *
 * VIKTIG: dette er en MASKINELL FORHÅNDSSJEKK, ikke erstatning for
 * skjermbilde-gaten. Grønn test her betyr "ingen åpenbar pixel-drift" —
 * Anders må fortsatt se og godkjenne skjermbildene manuelt før merge
 * (§Ferdig-definisjon per skjerm i plan-designport-alle-skjermer.md).
 * `maxDiffPixelRatio` er satt romslig (4 %) fordi fonter/anti-aliasing
 * varierer selv når layout er identisk — stram den til hvis dere vil ha
 * strengere maskinell dekning, men ikke sett den til 0.
 *
 * JUSTER selector: `fasitInnholdLocator()` prøver #kropp → main → .phone.
 * `BUILT_CONTENT_SELECTOR` under er en generisk gjetning (`main`) — bytt til
 * den faktiske innholds-wrapperen i den bygde ruta (ikke rail/nav-chrome)
 * hvis appens layout skiller seg fra fasitens.
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

const FASIT_ABS_PATH = path.resolve(
  __dirname,
  "../../../designsystem/paper/fase1/playerhq-analyse.html",
);
const BUILT_ROUTE = "/portal/analysere";
const BUILT_CONTENT_SELECTOR = "main";

const ER_SEED = process.env.PAPER_SEED === "1";

const CASES: Array<{ viewport: keyof typeof PAPER_VIEWPORTS; tema: PaperTema }> = [
  { viewport: "mobil", tema: "light" },
  { viewport: "mobil", tema: "dark" },
  { viewport: "desktop", tema: "light" },
  { viewport: "desktop", tema: "dark" },
];

for (const { viewport, tema } of CASES) {
  const snapshotName = `portal-analysere-${viewport}-${tema}.png`;

  test(`portal/analysere ${viewport} ${tema} matcher Paper-fasit`, async ({
    page,
  }) => {
    await page.setViewportSize(PAPER_VIEWPORTS[viewport]);

    if (ER_SEED) {
      // Fasit er i .phone[data-demo-only] — ikke skjul hele phone
      await openFasitFile(page, FASIT_ABS_PATH);
      await page.evaluate((t) => {
        document.documentElement.setAttribute("data-theme", t);
      }, tema);
      await page.addStyleTag({ content: ".state-switch { display: none !important; }" });
      const target = page.locator(".phone, #kropp, body").first();
      await expect(target).toHaveScreenshot(snapshotName, { maxDiffPixelRatio: 0.04 });
      return;
    }

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
