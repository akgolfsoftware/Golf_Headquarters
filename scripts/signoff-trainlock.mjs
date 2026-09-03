// Sign-off-galleri mot TRAIN-LOCK-fasiten (ikke Paper).
//
// signoff-gallery.mjs sammenligner mot designsystem/paper/fase1/, som er arkiv
// siden 25.08.2026. PX-portene måles mot designsystem/train-lock/*.dc.html.
// Dette skriptet er samme motor med riktig fasitkatalog.
//
// Kjør:  node scripts/signoff-trainlock.mjs <BOLGE> [BASE_URL]
//   BOLGE = px3 | px4        (skjermlistene under)
//
// Ut:  screenshots/train-lock/<bolge>/<id>-<device>-<tema>.png  (app)
//      screenshots/train-lock/<bolge>/fasit-<id>-<tema>.png     (fasit)
import { config as loadEnv } from "dotenv";
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

loadEnv({ path: ".env.local" });

const BOLGE = process.argv[2];
const BASE = process.argv[3] || process.env.SHOT_BASE || "http://localhost:3000";
const FASIT_DIR = "designsystem/train-lock";
const PASSWORD = process.env.SHOT_PASSWORD || process.env.SCREENTEST_PASSWORD;
const SPILLER = "screentest@akgolf.test";
const BRUKER = process.env.SHOT_BRUKER || SPILLER;

const VP = {
  m390: { width: 390, height: 844, isMobile: true, hasTouch: true },
  d1280: { width: 1280, height: 900, isMobile: false, hasTouch: false },
};

// Skjermer per bølge. `fasit` = filnavn i designsystem/train-lock/.
const BOLGER = {
  px3: [
    { id: "TE-01", navn: "Tester (hub)", rute: "/portal/tren/tester", fasit: "TE-01 Tester hub iPhone.dc.html" },
    { id: "TM-04", navn: "Analyse-hub", rute: "/portal/analysere", fasit: "TM-04 Analyse-hub TrackMan.dc.html" },
    { id: "TM-01", navn: "TrackMan liste", rute: "/portal/analysere/trackman", fasit: "TM-01 TrackMan liste.dc.html" },
  ],
  // #662: AgencyOS-skjermer — krever ADMIN-rolle på innloggingsbrukeren.
  ao: [
    { id: "AO-01", navn: "AgenticOS cockpit", rute: "/admin/agenticos", fasit: "AO-01 Cockpit ko godkjenning.dc.html" },
    { id: "AO-ko", navn: "Kø", rute: "/admin/agenticos/ko", fasit: "AO-01 Cockpit ko godkjenning.dc.html" },
    { id: "AO-godkjenn", navn: "Godkjenn", rute: "/admin/agenticos/godkjenn", fasit: "AO-12 Godkjenningspolicy A3 B1 C3.dc.html" },
  ],
  px4: [
    { id: "PH-01", navn: "I dag (hjem)", rute: "/portal", fasit: "PH-01 I dag.dc.html" },
    { id: "PH-07", navn: "Plan / agenda", rute: "/portal/planlegge", fasit: "PH-07 Plan.dc.html" },
    { id: "RU-04", navn: "Etterregistrering", rute: "/portal/runde/logg", fasit: "RU-04 Player Etterregistrering ark.dc.html" },
  ],
};

if (!BOLGE || !BOLGER[BOLGE]) {
  console.error(`Ukjent bølge "${BOLGE}". Gyldige: ${Object.keys(BOLGER).join(", ")}`);
  process.exit(1);
}
if (!PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler i .env.local (eller sett SHOT_PASSWORD)");
  process.exit(1);
}

const OUT = `screenshots/train-lock/${BOLGE}`;
const browser = await chromium.launch();
const logg = [];

async function nyKontekst(device, tema) {
  const vp = VP[device];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    deviceScaleFactor: 1,
  });
  const url = new URL(BASE);
  await ctx.addCookies([{ name: "ak-v2-tema", value: tema, domain: url.hostname, path: "/" }]);
  await ctx.addInitScript(() => {
    try { localStorage.setItem("ak_cookie_consent", "all"); } catch {}
  });
  return ctx;
}

async function loggInn(ctx, epost) {
  for (let i = 1; i <= 2; i++) {
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 90000 });
      await page.waitForSelector('input[type="email"]', { timeout: 90000 });
      await page.fill('input[type="email"]', epost);
      await page.fill('input[type="password"]', PASSWORD);
      await Promise.all([
        page.waitForURL(/\/(portal|admin|forelder)/, { timeout: 45000 }).catch(() => {}),
        page.click('button[type="submit"]'),
      ]);
      await page.waitForTimeout(1500);
      const ok = /\/(portal|admin|forelder)/.test(page.url());
      await page.close();
      if (ok) return true;
    } catch { await page.close().catch(() => {}); }
    if (i < 2) await new Promise((r) => setTimeout(r, 4000));
  }
  return false;
}

async function appShot(ctx, rute, fil) {
  const page = await ctx.newPage();
  try {
    await page.goto(`${BASE}${rute}`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(3500); // la klientflater rendre ferdig
    await page.screenshot({ path: fil, fullPage: false }); // vindu, ikke fullside
    return true;
  } catch (e) {
    logg.push(`FEIL app ${rute}: ${e.message.split("\n")[0]}`);
    return false;
  } finally { await page.close().catch(() => {}); }
}

async function fasitShot(ctx, fasitFil, fil) {
  const sti = path.resolve(FASIT_DIR, fasitFil);
  if (!existsSync(sti)) { logg.push(`MANGLER fasit: ${fasitFil}`); return false; }
  const page = await ctx.newPage();
  try {
    await page.goto(`file://${sti}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: fil, fullPage: true });
    return true;
  } catch (e) {
    logg.push(`FEIL fasit ${fasitFil}: ${e.message.split("\n")[0]}`);
    return false;
  } finally { await page.close().catch(() => {}); }
}

await mkdir(OUT, { recursive: true });

for (const tema of ["dark", "light"]) {
  for (const device of ["m390", "d1280"]) {
    const ctx = await nyKontekst(device, tema);
    const inne = await loggInn(ctx, BRUKER);
    if (!inne) { logg.push(`FEIL innlogging (${device}/${tema})`); await ctx.close(); continue; }
    for (const s of BOLGER[BOLGE]) {
      const ok = await appShot(ctx, s.rute, `${OUT}/${s.id}-${device}-${tema}.png`);
      logg.push(`${ok ? "OK  " : "FEIL"} app   ${s.id} ${device} ${tema}`);
    }
    await ctx.close();
  }
}

// Fasit tas én gang per device (fasitfilene har egne innebygde rammer).
{
  // Fasit tas i bred viewport + fullPage: filene tegner egne enhetsrammer og
  // klippes hvis de presses inn i en 390px-viewport.
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 1 });
  for (const s of BOLGER[BOLGE]) {
    const ok = await fasitShot(ctx, s.fasit, `${OUT}/fasit-${s.id}.png`);
    logg.push(`${ok ? "OK  " : "FEIL"} fasit ${s.id}`);
  }
  await ctx.close();
}

await browser.close();
console.log(logg.join("\n"));
console.log(`\nBilder i ${OUT}/`);
