/**
 * PH-06-rigg — screenshot-pass over de statiske SSR-markup-filene fra
 * `render.tsx`. SIMULERT: åpner file:// direkte i en frittstående Chromium-
 * instans (samme mønster som scripts/train-lock-pixel-diff.mjs), ingen Next
 * dev-server, ingen database, ingen innlogget bruker. Bevarer kun
 * første-malingen (SessionSummary med syntetiske props) — ikke
 * klientinteraksjon (skriving, lagre/feil/retry, fokus/tastatur).
 *
 * Kjøres frittstående (ikke via `playwright test`/testDir) for å ikke røre
 * den delte playwright.config.ts (testDir: tests/e2e) — egen rigg per
 * eierskapsavtalen i docs/planer/arbeidsdeling-codex-claude-2026-09-11.md.
 *
 * Forutsetning: render.tsx er kjørt først (skriver til
 * tests/visual/ut/playerhq-summary/).
 *
 * Kjør: npx tsx tests/visual/playerhq-summary/screenshot.ts
 * Skjermbilder havner i _archive/visuell-kontroll-ph06-2026-09-11/
 * (gitignorert, aldri i public/Git — se AGENTS.md §Data og sikkerhet).
 */
import { chromium } from "playwright";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HER = path.dirname(fileURLToPath(import.meta.url));
const UT_DIR = path.resolve(HER, "..", "ut", "playerhq-summary");
const ARKIV_DIR = path.resolve(HER, "..", "..", "..", "_archive", "visuell-kontroll-ph06-2026-09-11");

const VIEWPORTS: Array<{ navn: string; width: number; height: number }> = [
  { navn: "320", width: 320, height: 1400 },
  { navn: "390", width: 390, height: 1500 },
  { navn: "834", width: 834, height: 1600 },
  { navn: "1440", width: 1440, height: 1400 },
];

async function main() {
  if (!existsSync(UT_DIR)) {
    console.error(`Mangler ${UT_DIR} — kjør render.tsx først.`);
    process.exit(1);
  }
  mkdirSync(ARKIV_DIR, { recursive: true });

  const filer = readdirSync(UT_DIR).filter((f) => f.endsWith(".html"));
  // Normal sti: la Playwright resolve sin egen nedlastede Chromium (lokal
  // maskin/CI). Faller kun tilbake til en forhåndsinstallert binær når
  // build-nummeret i sandkasse-miljøet avviker fra det playwright-core
  // forventer (ren rigg-robusthet, ikke en påstand om Anders' oppsett).
  const forhaandsinstallert = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
  const browser = await chromium.launch().catch((feil) => {
    if (!existsSync(forhaandsinstallert)) throw feil;
    return chromium.launch({ executablePath: forhaandsinstallert });
  });
  const page = await browser.newPage();
  let antall = 0;

  for (const fil of filer) {
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`file://${path.join(UT_DIR, fil)}`);
      const navn = `${fil.replace(".html", "")}--${vp.navn}px.png`;
      await page.screenshot({ path: path.join(ARKIV_DIR, navn), fullPage: true });
      antall += 1;
    }
  }

  // 200 % tekst — CSS zoom på body er nærmeste headless-ekvivalent til
  // nettleserens tekstforstørring (øker skrift OG layout likt), for lys tema
  // ved mobilbredde (der trangest plass gjør evt. clipping synlig).
  for (const fil of filer.filter((f) => f.includes("--lys"))) {
    await page.setViewportSize({ width: 390, height: 1800 });
    await page.goto(`file://${path.join(UT_DIR, fil)}`);
    await page.addStyleTag({ content: "body { zoom: 2; }" });
    const navn = `${fil.replace(".html", "")}--390px-200pct.png`;
    await page.screenshot({ path: path.join(ARKIV_DIR, navn), fullPage: true });
    antall += 1;
  }

  await browser.close();
  console.log(`PH-06-rigg: ${antall} skjermbilder skrevet til ${ARKIV_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
