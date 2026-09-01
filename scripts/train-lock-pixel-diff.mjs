// Pilot/kalibrerings-skript for sign-off-riggen: fasit-ramme (isolert,
// element.screenshot()) vs app-skjermbilde (samme viewport-størrelse,
// innlogget) → pixelmatch-diff med prosenttall og diff-bilde.
//
// Brukes til å KALIBRERE mapping (rute, viewport, evt. cropTop for baked-in
// statuslinje) skjerm for skjerm, før den låses i tests/visual/skjerm-mapping.ts.
// Selve CI-testen er tests/visual/train-lock-pixelnaerhet.spec.ts.
//
// Kjør:  node scripts/train-lock-pixel-diff.mjs <label> <rute> [tema] [cropTop] [BASE_URL]
import { config as loadEnv } from "dotenv";
import { chromium } from "playwright";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { readdir, readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

loadEnv({ path: ".env.local" });

const FASIT_DIR = "designsystem/train-lock";
const OUT_DIR = "tests/visual/ut";

const [label, rute, tema = "dark", cropTopArg = "0", BASE = process.env.SHOT_BASE || "https://akgolf-hq.vercel.app"] = process.argv.slice(2);
const cropTop = Number(cropTopArg);
// Fryser "i dag" til fasitens dato (kun screentest, se src/lib/testing/dato-override.ts).
const TEST_NAA = "2026-08-22T07:10:00Z"; // 09:10 Oslo, midt i den seedede 09:00-09:50-økten
const PASSWORD = process.env.SHOT_PASSWORD || process.env.SCREENTEST_PASSWORD;
const BRUKER = process.env.SHOT_BRUKER || "screentest@akgolf.test";

if (!label || !rute) {
  console.error("Bruk: node scripts/train-lock-pixel-diff.mjs <label> <rute> [tema=dark] [cropTop=0] [BASE_URL]");
  process.exit(1);
}
if (!PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler i .env.local (eller sett SHOT_PASSWORD)");
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
  console.error(`Fant ingen .dc.html med data-screen-label="${label}"`);
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();

// 1) Fasit-ramme, isolert, ekte pikselstørrelse.
const fasitPage = await (await browser.newContext({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 })).newPage();
await fasitPage.goto(`file://${path.resolve(FASIT_DIR, fasitFil)}`, { waitUntil: "domcontentloaded", timeout: 60000 });
await fasitPage.waitForTimeout(800);
const fasitEl = await fasitPage.$(`[data-screen-label="${label}"]`);
if (!fasitEl) {
  console.error(`"${fasitFil}" har ikke data-screen-label="${label}" i DOM-en (helmet/script-feil?).`);
  process.exit(1);
}
const box = await fasitEl.boundingBox();
const fasitFilSti = `${OUT_DIR}/${slug(label)}-fasit.png`;
await fasitEl.screenshot({ path: fasitFilSti });
await fasitPage.close();

// 2) App-skjermbilde, samme bredde/høyde som fasit-rammen, innlogget.
const width = Math.round(box.width);
const height = Math.round(box.height);
const isMobile = width < 700;
const ctx = await browser.newContext({
  viewport: { width, height },
  isMobile,
  hasTouch: isMobile,
  deviceScaleFactor: 1,
});
const url = new URL(BASE);
await ctx.addCookies([{ name: "ak-v2-tema", value: tema, domain: url.hostname, path: "/" }]);
await ctx.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });

let innlogget = false;
for (let i = 1; i <= 2 && !innlogget; i++) {
  const p = await ctx.newPage();
  try {
    await p.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await p.waitForSelector('input[type="email"]', { timeout: 90000 });
    await p.fill('input[type="email"]', BRUKER);
    await p.fill('input[type="password"]', PASSWORD);
    await Promise.all([
      p.waitForURL(/\/(portal|admin|forelder)/, { timeout: 45000 }).catch(() => {}),
      p.click('button[type="submit"]'),
    ]);
    await p.waitForTimeout(1500);
    innlogget = /\/(portal|admin|forelder)/.test(p.url());
    await p.close();
  } catch (e) { await p.close().catch(() => {}); }
}
if (!innlogget) {
  console.error("Innlogging feilet.");
  process.exit(1);
}

await ctx.setExtraHTTPHeaders({ "x-screentest-naa": TEST_NAA });
const appPage = await ctx.newPage();
await appPage.goto(`${BASE}${rute}`, { waitUntil: "domcontentloaded", timeout: 90000 });
await appPage.waitForTimeout(3000);
const appFilSti = `${OUT_DIR}/${slug(label)}-app.png`;
await appPage.screenshot({ path: appFilSti, fullPage: false });
await browser.close();

// 3) Diff — fasiten har en bakt-inn statuslinje øverst (dynamic island, klokke)
// som appen ikke har (ekte enhets-statuslinje ligger UTENFOR siden, ikke i
// DOM-en). Kutt cropTop px fra TOPPEN av fasiten (hopp over den bakte linja),
// og cropTop px fra BUNNEN av appen (samme resulterende høyde, men innholdet
// starter på reelt y=0 i appen — kutter man toppen der i stedet, forskyver
// man alt appinnhold cropTop px og får falsk spøkelses-diff).
const fasitPng = PNG.sync.read(await readFile(fasitFilSti));
const appPng = PNG.sync.read(await readFile(appFilSti));

function kuttTopp(png, top) {
  if (!top) return png;
  const ut = new PNG({ width: png.width, height: png.height - top });
  PNG.bitblt(png, ut, 0, top, png.width, png.height - top, 0, 0);
  return ut;
}
function kuttBunn(png, bottom) {
  if (!bottom) return png;
  const ut = new PNG({ width: png.width, height: png.height - bottom });
  PNG.bitblt(png, ut, 0, 0, png.width, png.height - bottom, 0, 0);
  return ut;
}

const fasitKuttet = kuttTopp(fasitPng, cropTop);
const appKuttet = kuttBunn(appPng, cropTop);

if (fasitKuttet.width !== appKuttet.width || fasitKuttet.height !== appKuttet.height) {
  console.error(
    `STØRRELSE MATCHER IKKE: fasit ${fasitKuttet.width}×${fasitKuttet.height} vs app ${appKuttet.width}×${appKuttet.height} (etter cropTop=${cropTop}).`
  );
  process.exit(1);
}

const diffPng = new PNG({ width: fasitKuttet.width, height: fasitKuttet.height });
const avvikPiksler = pixelmatch(
  fasitKuttet.data,
  appKuttet.data,
  diffPng.data,
  fasitKuttet.width,
  fasitKuttet.height,
  { threshold: 0.1 }
);
const totalPiksler = fasitKuttet.width * fasitKuttet.height;
const andel = avvikPiksler / totalPiksler;

const diffFilSti = `${OUT_DIR}/${slug(label)}-diff.png`;
await import("node:fs/promises").then((fs) => fs.writeFile(diffFilSti, PNG.sync.write(diffPng)));

console.log(`${label} (${rute}, ${tema}, cropTop=${cropTop})`);
console.log(`  fasit: ${fasitFilSti}`);
console.log(`  app:   ${appFilSti}`);
console.log(`  diff:  ${diffFilSti}`);
console.log(`  avvik: ${avvikPiksler}/${totalPiksler} px = ${(andel * 100).toFixed(2)}%`);

function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
