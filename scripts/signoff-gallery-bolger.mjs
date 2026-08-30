// Sign-off-galleri for BØLGENE (W1/W2/W3 + fase1-rester + D-radene + W5/W6):
// alle skjermer i PAPER-ZIP-CHECKLIST.md som venter på Anders' pixel-signering.
// Kopi av motoren i scripts/signoff-gallery.mjs med utvidet SCREENS-liste og
// en id-oppløser: detaljruter uten kjent id finner første lenke på listesiden
// (`finn: { fra, monster }`) — ingen DB-oppslag.
//
// Kjør:  node scripts/signoff-gallery-bolger.mjs [SCREEN_IDS_CSV] [BASE_URL]
//   SCREEN_IDS_CSV = f.eks. "W1-drills,W2-datagolf"  (default: alle i SCREENS)
//   BASE_URL       = default http://localhost:3000
//
// Output: screenshots/paper/signoff/<id>-<m390|d1280>.png (app | fasit, hele siden)
//         screenshots/paper/signoff/<id>-m390-dark.png    (app mørk, hele siden)
//         screenshots/paper/signoff/vindu-<id>-<m390|d1280>-light.png
//         screenshots/paper/signoff/vindu-<id>-m390-dark.png
import { config as loadEnv } from "dotenv";
import { chromium } from "playwright";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

loadEnv({ path: ".env.local" });

const BASE = process.argv[3] || process.env.SHOT_BASE || "http://localhost:3000";
const OUT = "screenshots/paper/signoff";
const FASIT_DIR = "designsystem/paper/fase1";
const PASSWORD = process.env.SHOT_PASSWORD || process.env.SCREENTEST_PASSWORD;
const SPILLER = "screentest@akgolf.test";
const COACH = "coachtest@akgolf.test";
const FORELDER = "screentest-parent@akgolf.test";

const VP = {
  m390: { width: 390, height: 844, isMobile: true, hasTouch: true },
  d1280: { width: 1280, height: 900, isMobile: false, hasTouch: false },
};

const F2P = "../fase2/playerhq";

/**
 * Skjermkø. fasit-feltene er filnavn relativt til designsystem/paper/fase1/.
 * `finn` = { fra, monster, suffiks? }: løses til en ekte rute ved å hente første
 * <a href> på `fra`-siden som matcher regex `monster` (query strippes).
 * Session-id-ene er screentest-brukerens (Øyvind Rohjan) i prod — kun lesing.
 */
const SCREENS = [
  // C1 · Fase 1-rester
  { id: "C1-runde-live", navn: "Runde live", rute: "/portal/runde/live", bruker: SPILLER, fasitM: "playerhq-runde-live.html", fasitD: "playerhq-runde-live.html" },
  { id: "C1-test-gjennomfor", navn: "Test-gjennomføring", bruker: SPILLER, finn: { fra: "/portal/tren/tester", monster: "^/portal/tren/tester/(?!ny$)[^/]+$", suffiks: "/gjennomfor" }, fasitM: "playerhq-test-gjennomfor.html", fasitD: "playerhq-test-gjennomfor.html" },
  { id: "C1-spillerprofil", navn: "Spillerprofil (admin)", rute: "/admin/spillere/c7e2811d-86e1-49fe-9100-d33d5056eac2", bruker: COACH, fasitM: "spillerprofil.html", fasitD: "spillerprofil.html" },
  // W1 · drill/plan/test/turnering
  { id: "W1-drills", navn: "Drills-bibliotek", rute: "/portal/drills", bruker: SPILLER, fasitM: `${F2P}/playerhq-drills.html`, fasitD: `${F2P}/playerhq-drills.html` },
  { id: "W1-drill-detalj", navn: "Drill-detalj", bruker: SPILLER, finn: { fra: "/portal/drills", monster: "^/portal/drills/[^/]+$" }, fasitM: `${F2P}/playerhq-drill-detalj.html`, fasitD: `${F2P}/playerhq-drill-detalj.html` },
  { id: "W1-feiring", navn: "Plan-feiring", bruker: SPILLER, finn: { fra: "/portal/planlegge", monster: "^/portal/tren/feiring/[^/]+$" }, fasitM: `${F2P}/playerhq-feiring.html`, fasitD: `${F2P}/playerhq-feiring.html` },
  { id: "W1-fys-plan", navn: "FYS-plan", rute: "/portal/tren/fys-plan", bruker: SPILLER, fasitM: `${F2P}/playerhq-fys-plan.html`, fasitD: `${F2P}/playerhq-fys-plan.html` },
  { id: "W1-live-tapper", navn: "Live tapper", bruker: SPILLER, finn: { fra: "/portal/live/cmseta469002e8ubpchfgs6ef/brief", monster: "^/portal/live/[^/]+/tapper$" }, fasitM: `${F2P}/playerhq-live-tapper.html`, fasitD: `${F2P}/playerhq-live-tapper.html` },
  { id: "W1-okt-detalj", navn: "Økt-detalj", rute: "/portal/gjennomfore/cmseta469002e8ubpchfgs6ef", bruker: SPILLER, fasitM: `${F2P}/playerhq-okt-detalj.html`, fasitD: `${F2P}/playerhq-okt-detalj.html` },
  { id: "W1-teknisk-plan", navn: "Teknisk plan", rute: "/portal/tren/teknisk-plan/paper-signoff", bruker: SPILLER, fasitM: `${F2P}/playerhq-teknisk-plan.html`, fasitD: `${F2P}/playerhq-teknisk-plan.html` },
  { id: "W1-test-detalj", navn: "Test-detalj", bruker: SPILLER, finn: { fra: "/portal/tren/tester", monster: "^/portal/tren/tester/(?!ny$)[^/]+$" }, fasitM: `${F2P}/playerhq-test-detalj.html`, fasitD: `${F2P}/playerhq-test-detalj.html` },
  { id: "W1-tester-hub", navn: "Tester-hub", rute: "/portal/tren/tester", bruker: SPILLER, fasitM: `${F2P}/playerhq-tester-hub.html`, fasitD: `${F2P}/playerhq-tester-hub.html` },
  { id: "W1-turnering-detalj", navn: "Turnering-detalj", bruker: SPILLER, finn: { fra: "/portal/tren/turneringer", monster: "^/portal/tren/turneringer/[^/]+$" }, fasitM: `${F2P}/playerhq-turnering-detalj.html`, fasitD: `${F2P}/playerhq-turnering-detalj.html` },
  { id: "W1-turneringer", navn: "Turneringer", rute: "/portal/tren/turneringer", bruker: SPILLER, fasitM: `${F2P}/playerhq-turneringer.html`, fasitD: `${F2P}/playerhq-turneringer.html` },
  // W2 · Analysere-dybde
  { id: "W2-analyse-hull", navn: "Analyse: hull", rute: "/portal/analysere/hull", bruker: SPILLER, fasitM: `${F2P}/playerhq-analyse-hull.html`, fasitD: `${F2P}/playerhq-analyse-hull.html` },
  { id: "W2-runder-liste", navn: "Runder-liste", rute: "/portal/mal/runder", bruker: SPILLER, fasitM: `${F2P}/playerhq-runder-liste.html`, fasitD: `${F2P}/playerhq-runder-liste.html` },
  { id: "W2-runde-detalj", navn: "Runde-detalj", bruker: SPILLER, finn: { fra: "/portal/mal/runder", monster: "^/portal/mal/runder/(?!ny$)[^/]+$" }, fasitM: `${F2P}/playerhq-runde-detalj.html`, fasitD: `${F2P}/playerhq-runde-detalj.html` },
  { id: "W2-gameplan-liste", navn: "Gameplan-liste", rute: "/portal/gameplan", bruker: SPILLER, fasitM: `${F2P}/playerhq-gameplan-liste.html`, fasitD: `${F2P}/playerhq-gameplan-liste.html` },
  { id: "W2-gameplan-banekart", navn: "Gameplan banekart", bruker: SPILLER, finn: { fra: "/portal/gameplan", monster: "^/portal/gameplan/[^/]+$" }, fasitM: `${F2P}/playerhq-gameplan-banekart.html`, fasitD: `${F2P}/playerhq-gameplan-banekart.html` },
  { id: "W2-datagolf", navn: "DataGolf", rute: "/portal/datagolf", bruker: SPILLER, fasitM: `${F2P}/playerhq-datagolf.html`, fasitD: `${F2P}/playerhq-datagolf.html` },
  { id: "W2-trackman-liste", navn: "TrackMan-liste", rute: "/portal/mal/trackman", bruker: SPILLER, fasitM: `${F2P}/playerhq-trackman-liste.html`, fasitD: `${F2P}/playerhq-trackman-liste.html` },
  { id: "W2-trackman-detalj", navn: "TrackMan-detalj", bruker: SPILLER, finn: { fra: "/portal/mal/trackman", monster: "^/portal/mal/trackman/(?!gapping$)[^/]+$" }, fasitM: `${F2P}/playerhq-trackman-detalj.html`, fasitD: `${F2P}/playerhq-trackman-detalj.html` },
  { id: "W2-putte-lab", navn: "Putte-lab", rute: "/portal/trening/putte-laboratoriet", bruker: SPILLER, fasitM: `${F2P}/playerhq-putte-lab.html`, fasitD: `${F2P}/playerhq-putte-lab.html` },
  { id: "W2-historikk-filter", navn: "Historikk + filter-sheet", rute: "/portal/analysere/historikk", bruker: SPILLER, klikk: 'button[aria-label="Åpne filter"]', fasitM: `${F2P}/playerhq-historikk-filter-sheet.html`, fasitD: `${F2P}/playerhq-historikk-filter-sheet.html` },
  { id: "W2-hjem-rest", navn: "Hjem: utenfor banen", rute: "/portal/utenfor-banen", bruker: SPILLER, fasitM: `${F2P}/playerhq-hjem-rest.html`, fasitD: `${F2P}/playerhq-hjem-rest.html` },
  { id: "W2-hjem-varsler", navn: "Hjem: varsler", rute: "/portal/varsler", bruker: SPILLER, fasitM: `${F2P}/playerhq-hjem-varsler.html`, fasitD: `${F2P}/playerhq-hjem-varsler.html` },
  // W3 · Meg/Booking/Talent/Coach (inkl. de tre NYE 16.08-fasitene)
  { id: "W3-innstillinger", navn: "Innstillinger-hub", rute: "/portal/meg/innstillinger", bruker: SPILLER, fasitM: `${F2P}/playerhq-innstillinger.html`, fasitD: `${F2P}/playerhq-innstillinger.html` },
  { id: "W3-abonnement", navn: "Abonnement", rute: "/portal/meg/abonnement", bruker: SPILLER, fasitM: `${F2P}/playerhq-abonnement.html`, fasitD: `${F2P}/playerhq-abonnement.html` },
  { id: "W3-helse", navn: "Helse", rute: "/portal/meg/helse", bruker: SPILLER, fasitM: `${F2P}/playerhq-helse.html`, fasitD: `${F2P}/playerhq-helse.html` },
  { id: "W3-booking-ny", navn: "Booking: ny", rute: "/portal/booking/ny", bruker: SPILLER, fasitM: `${F2P}/playerhq-booking-ny.html`, fasitD: `${F2P}/playerhq-booking-ny.html` },
  { id: "W3-booking-mine", navn: "Booking: detalj (mine)", bruker: SPILLER, finn: { fra: "/portal/meg/bookinger", monster: "^/portal/booking/(?!ny$|bekreftet$)[^/]+$" }, fallback: "/portal/meg/bookinger", fasitM: `${F2P}/playerhq-booking-mine.html`, fasitD: `${F2P}/playerhq-booking-mine.html` },
  { id: "W3-talent", navn: "Talent", rute: "/portal/talent", bruker: SPILLER, fasitM: `${F2P}/playerhq-talent.html`, fasitD: `${F2P}/playerhq-talent.html` },
  { id: "W3-profil", navn: "Meg: profil (NY)", rute: "/portal/meg/profil", bruker: SPILLER, fasitM: `${F2P}/playerhq-profil.html`, fasitD: `${F2P}/playerhq-profil.html` },
  { id: "W3-utstyr", navn: "Meg: utstyr (NY)", rute: "/portal/meg/utstyr", bruker: SPILLER, fasitM: `${F2P}/playerhq-utstyr.html`, fasitD: `${F2P}/playerhq-utstyr.html` },
  { id: "W3-coach-tilbakemelding", navn: "Coach-tilbakemelding (NY)", rute: "/portal/coach/tilbakemelding/cmseta1bl00278ubpcqcfio9y", bruker: SPILLER, fasitM: `${F2P}/playerhq-coach-tilbakemelding.html`, fasitD: `${F2P}/playerhq-coach-tilbakemelding.html` },
  // C2 · D-radene (D3/D5/D6)
  { id: "C2-D3-ukesdigest", navn: "Ukesdigest", rute: "/portal/ukesdigest", bruker: SPILLER, fasitM: `${F2P}/playerhq-ukesdigest.html`, fasitD: `${F2P}/playerhq-ukesdigest.html` },
  { id: "C2-D3-godkjenninger", navn: "Godkjenninger m/rapportkort", rute: "/admin/godkjenninger", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-godkjenninger.html", fasitD: "../fase2/agencyos/agencyos-godkjenninger.html" },
  { id: "C2-D3-ukerapport", navn: "Forelder: ukerapport", rute: "/forelder/ukerapport", bruker: FORELDER, fasitM: "../fase2/forelder/forelder-barn.html", fasitD: "../fase2/forelder/forelder-barn.html" },
  { id: "C2-D5-gapping", navn: "Gapping", rute: "/portal/mal/trackman/gapping", bruker: SPILLER, fasitM: `${F2P}/playerhq-gapping.html`, fasitD: `${F2P}/playerhq-gapping.html` },
  { id: "C2-D6-skoletid", navn: "Forelder: barn + skoletid", rute: "/forelder/barn", bruker: FORELDER, fasitM: "../fase2/forelder/forelder-barn.html", fasitD: "../fase2/forelder/forelder-barn.html" },
  // W5/W6 · resterende [~]-rader i checklisten
  { id: "W5-marketing", navn: "Marketing forside", rute: "/", bruker: null, fasitM: "../fase2/marketing/marketing-side.html", fasitD: "../fase2/marketing/marketing-side.html" },
  { id: "W5-auth-flyt", navn: "Auth: signup", rute: "/auth/signup", bruker: null, fasitM: "../fase2/auth/auth-flyt.html", fasitD: "../fase2/auth/auth-flyt.html" },
  { id: "W5-auth-samtykke", navn: "Auth: samtykke-venter", rute: "/auth/samtykke-venter", bruker: null, fasitM: "../fase2/auth/auth-samtykke.html", fasitD: "../fase2/auth/auth-samtykke.html" },
  { id: "W6-wang-arsplan", navn: "WANG coach-årsplan", rute: "/team-wang/coach", bruker: COACH, fasitM: "../fase2/wang/wang-coach-arsplan.html", fasitD: "../fase2/wang/wang-coach-arsplan.html" },
  { id: "W6-gfgk-veileder", navn: "GFGK veileder-artikkel", bruker: null, finn: { fra: "/gfgk-junior/veileder", monster: "^/gfgk-junior/veileder/[^/]+$" }, fasitM: "../fase2/gfgk/gfgk-veileder-artikkel.html", fasitD: "../fase2/gfgk/gfgk-veileder-artikkel.html" },
];

const only = (process.argv[2] || "").trim();
const kø = only ? SCREENS.filter((s) => only.split(",").includes(s.id)) : SCREENS;

const SKJUL_DEV = "nextjs-portal,[data-nextjs-toast],#__next-dev-tools-indicator{display:none!important}";

if (!PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler i .env.local (eller sett SHOT_PASSWORD)");
  process.exit(1);
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });

/** Ny kontekst med tema-cookie satt før første paint (unngår lys-blink). */
async function nyKontekst(device, tema) {
  const vp = VP[device];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    deviceScaleFactor: 1,
  });
  const url = new URL(BASE);
  await ctx.addCookies([
    { name: "ak-v2-tema", value: tema, domain: url.hostname, path: "/" },
  ]);
  await ctx.addInitScript(() => {
    try { localStorage.setItem("ak_cookie_consent", "all"); } catch {}
  });
  return ctx;
}

async function loggInn(ctx, epost, forsok = 2) {
  for (let i = 1; i <= forsok; i++) {
    if (await loggInnEnGang(ctx, epost)) return true;
    if (i < forsok) await new Promise((r) => setTimeout(r, 4000));
  }
  return false;
}

async function loggInnEnGang(ctx, epost) {
  const page = await ctx.newPage();
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
  return ok;
}

/** `vindu: true` tar bare det som er synlig i vinduet, ikke hele siden. */
async function appShot(ctx, rute, fil, { vindu = false, klikk = null } = {}) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}${rute}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);
  if (klikk) {
    await page.click(klikk, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(900);
  }
  await page.mouse.move(0, 0);
  if (!vindu) await page.evaluate(() => window.scrollTo(0, 0));
  await page.addStyleTag({ content: SKJUL_DEV }).catch(() => {});
  await page.waitForTimeout(200);
  await page.screenshot({ path: fil, fullPage: !vindu });
  const tekst = await page.evaluate(() => document.body.innerText.slice(0, 120).replace(/\s+/g, " "));
  const sluttUrl = page.url();
  await page.close();
  return { tekst, sluttUrl };
}

async function fasitShot(ctx, fasitFil, fil) {
  const abs = path.resolve(FASIT_DIR, fasitFil);
  if (!existsSync(abs)) return false;
  const page = await ctx.newPage();
  await page.goto(`file://${abs}`, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(600);
  await page.screenshot({ path: fil, fullPage: true });
  await page.close();
  return true;
}

/** Setter to bilder side om side (app venstre, fasit høyre) med etiketter. */
async function sideOmSide(appFil, fasitFil, utFil, bredde) {
  const enc = async (f) => `data:image/png;base64,${(await readFile(f)).toString("base64")}`;
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;background:#1a1a18;font:13px/1.4 -apple-system,system-ui,sans-serif;color:#EDEBE5}
    .rad{display:flex;gap:16px;padding:16px;align-items:flex-start}
    .kol{display:flex;flex-direction:column;gap:6px}
    .tag{font-weight:600;letter-spacing:.04em;text-transform:uppercase;font-size:11px;opacity:.75}
    img{display:block;width:${bredde}px;height:auto;border:1px solid #3a3a36;border-radius:6px}
  </style><div class="rad">
    <div class="kol"><div class="tag">App</div><img src="${await enc(appFil)}"></div>
    ${fasitFil ? `<div class="kol"><div class="tag">Fasit (Paper)</div><img src="${await enc(fasitFil)}"></div>` : ""}
  </div>`;
  const ctx = await browser.newContext({ viewport: { width: bredde * 2 + 60, height: 800 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: utFil, fullPage: true });
  await ctx.close();
}

const logg = [];
const økter = new Map(); // `${device}|${tema}|${bruker}` -> context

async function hentKontekst(device, tema, bruker) {
  const nøkkel = `${device}|${tema}|${bruker ?? "anon"}`;
  if (økter.has(nøkkel)) return økter.get(nøkkel);
  const ctx = await nyKontekst(device, tema);
  if (bruker) {
    const ok = await loggInn(ctx, bruker);
    if (!ok) {
      logg.push(`LOGIN-FEIL ${nøkkel}`);
      økter.set(nøkkel, null);
      return null;
    }
  }
  økter.set(nøkkel, ctx);
  return ctx;
}

/** Løser `finn`-ruter: første <a href> på listesiden som matcher mønsteret. */
async function løsRuter() {
  for (const s of kø) {
    if (!s.finn || s.rute) continue;
    const ctx = await hentKontekst("d1280", "light", s.bruker);
    if (!ctx) { s.feil = "innlogging feilet (id-oppslag)"; continue; }
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}${s.finn.fra}`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(800);
      const hrefs = await page.evaluate(() =>
        Array.from(document.querySelectorAll("a[href]")).map((a) => a.getAttribute("href")),
      );
      const re = new RegExp(s.finn.monster);
      const treff = hrefs.find((h) => h && re.test(h.split("?")[0]));
      if (treff) {
        s.rute = treff.split("?")[0] + (s.finn.suffiks || "");
        logg.push(`ID    ${s.id} → ${s.rute}`);
      } else if (s.fallback) {
        s.rute = s.fallback;
        logg.push(`ID    ${s.id} — ingen lenke matchet på ${s.finn.fra}; bruker fallback ${s.fallback}`);
      } else {
        s.feil = `ingen id funnet — ingen lenke matchet ${s.finn.monster} på ${s.finn.fra}`;
      }
    } catch (e) {
      s.feil = `id-oppslag feilet: ${String(e.message).split("\n")[0]}`;
    } finally {
      await page.close();
    }
  }
}

await løsRuter();

for (const s of kø) {
  if (s.feil) { logg.push(`FEIL  ${s.id} — ${s.feil}`); continue; }
  for (const device of ["m390", "d1280"]) {
    const fasitNavn = device === "m390" ? s.fasitM : s.fasitD;
    const appFil = `${OUT}/_raw-${s.id}-${device}-app.png`;
    const fasitFil = `${OUT}/_raw-${s.id}-${device}-fasit.png`;
    try {
      const ctx = await hentKontekst(device, "light", s.bruker);
      if (!ctx) { logg.push(`FEIL  ${s.id} ${device} — innlogging feilet`); continue; }
      const { tekst, sluttUrl } = await appShot(ctx, s.rute, appFil, { klikk: s.klikk });
      await appShot(ctx, s.rute, `${OUT}/vindu-${s.id}-${device}-light.png`, { vindu: true, klikk: s.klikk });
      const harFasit = await fasitShot(ctx, fasitNavn, fasitFil);
      await sideOmSide(appFil, harFasit ? fasitFil : null, `${OUT}/${s.id}-${device}.png`, VP[device].width);
      const redirected = !sluttUrl.includes(s.rute.split("?")[0]) ? `  [REDIRECT → ${sluttUrl.replace(BASE, "")}]` : "";
      logg.push(`OK    ${s.id} ${device.padEnd(6)} ${s.rute} — "${tekst.slice(0, 70)}"${harFasit ? "" : "  (FASIT MANGLER)"}${redirected}`);
    } catch (e) {
      logg.push(`FEIL  ${s.id} ${device} — ${String(e.message).split("\n")[0]}`);
    }
  }
  // Mørk modus: kun mobil (kontrastsjekk, jf. primary=accent-fellen)
  try {
    const ctx = await hentKontekst("m390", "dark", s.bruker);
    if (ctx) {
      await appShot(ctx, s.rute, `${OUT}/${s.id}-m390-dark.png`, { klikk: s.klikk });
      await appShot(ctx, s.rute, `${OUT}/vindu-${s.id}-m390-dark.png`, { vindu: true, klikk: s.klikk });
    }
  } catch (e) {
    logg.push(`FEIL  ${s.id} m390 mørk — ${String(e.message).split("\n")[0]}`);
  }
}

for (const ctx of økter.values()) if (ctx) await ctx.close();
await browser.close();

await writeFile(`${OUT}/_kjørelogg-bolger.txt`, logg.join("\n") + "\n");
console.log(logg.join("\n"));
console.log(`\nLagret i ${OUT}`);
