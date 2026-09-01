// Trekker ut ISOLERTE fasit-rammer fra Train-lock .dc.html-filer, i ekte
// pikselstørrelse — element.screenshot() på elementet med data-screen-label,
// ikke fullPage-skjermbilde av hele filen (som drar med tomrom rundt).
//
// Metoden er fra revisjonsøkten 30.08.2026 (se ak-brain-loggen): isolert
// rammescreenshot + DOM-måling, ikke øyemål på et rått galleri-skjermbilde.
//
// Kjør:  node scripts/train-lock-fasit-ramme.mjs <label> <ut-fil.png>
//   <label> = eksakt data-screen-label-verdi, f.eks. "PH-01 I dag"
//
// Finner selv riktig .dc.html i designsystem/train-lock/ ved å søke etter
// attributtet — du trenger ikke oppgi filnavn.
import { chromium } from "playwright";
import { readdir, readFile, mkdir } from "node:fs/promises";
import path from "node:path";

const FASIT_DIR = "designsystem/train-lock";

const label = process.argv[2];
const utFil = process.argv[3];

if (!label || !utFil) {
  console.error("Bruk: node scripts/train-lock-fasit-ramme.mjs <data-screen-label> <ut-fil.png>");
  process.exit(1);
}

async function finnFasitFil(label) {
  const filer = (await readdir(FASIT_DIR)).filter((f) => f.endsWith(".dc.html"));
  for (const fil of filer) {
    const innhold = await readFile(path.join(FASIT_DIR, fil), "utf8");
    if (innhold.includes(`data-screen-label="${label}"`)) return fil;
  }
  return null;
}

const fasitFil = await finnFasitFil(label);
if (!fasitFil) {
  console.error(`Fant ingen .dc.html i ${FASIT_DIR}/ med data-screen-label="${label}"`);
  process.exit(1);
}

const sti = path.resolve(FASIT_DIR, fasitFil);
const browser = await chromium.launch();
// Bred nok kontekst til at ingen fasit-ramme (opptil 1440px) klippes av viewporten.
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(`file://${sti}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(800);

const el = await page.$(`[data-screen-label="${label}"]`);
if (!el) {
  console.error(`Fant "${fasitFil}", men elementet med data-screen-label="${label}" ble ikke funnet i DOM-en.`);
  await browser.close();
  process.exit(1);
}

const box = await el.boundingBox();
await mkdir(path.dirname(utFil), { recursive: true }).catch(() => {});
await el.screenshot({ path: utFil });
await browser.close();

console.log(`OK  ${label}  ←  ${fasitFil}`);
console.log(`    ${Math.round(box.width)}×${Math.round(box.height)}px  →  ${utFil}`);
