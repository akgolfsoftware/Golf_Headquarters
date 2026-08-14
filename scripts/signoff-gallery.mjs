// Sign-off-galleri: tar app-skjermbilder (m390 + d1280, lys + mørk) og setter dem
// side om side med Paper-fasiten, slik at Anders kan signere fra iPhone.
//
// Kjør:  node scripts/signoff-gallery.mjs [SCREEN_IDS_CSV] [BASE_URL]
//   SCREEN_IDS_CSV = f.eks. "PP-1.1,PP-1.2"  (default: alle i SCREENS)
//   BASE_URL       = default http://localhost:3000
//
// Output: screenshots/paper/signoff/<id>-<m390|d1280>.png (app | fasit, hele siden)
//         screenshots/paper/signoff/<id>-m390-dark.png    (app mørk, hele siden)
//         screenshots/paper/signoff/vindu-<id>-<m390|d1280>-light.png
//         screenshots/paper/signoff/vindu-<id>-m390-dark.png
//   vindu-* = kun det som synes i vinduet. Det er DISSE som avgjør om bunnkrom
//   (skrivefelt, dokk, cookie-banner) sitter riktig — fullsidebildene kan ikke vise det.
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

const VP = {
  m390: { width: 390, height: 844, isMobile: true, hasTouch: true },
  d1280: { width: 1280, height: 900, isMobile: false, hasTouch: false },
};

/** Skjermkø. fasit-feltene er filnavn i designsystem/paper/fase1/. */
const SCREENS = [
  { id: "PP-1.1", navn: "PlayerHQ chat / hjem", rute: "/portal", bruker: SPILLER, fasitM: "playerhq-chat-mobil.html", fasitD: "playerhq-chat-desktop.html" },
  { id: "PP-1.2", navn: "PlayerHQ plan", rute: "/portal/planlegge", bruker: SPILLER, fasitM: "playerhq-plan.html", fasitD: "playerhq-plan.html" },
  { id: "PP-1.3", navn: "PlayerHQ analyse", rute: "/portal/analysere", bruker: SPILLER, fasitM: "playerhq-analyse.html", fasitD: "playerhq-analyse.html" },
  { id: "PP-1.4", navn: "PlayerHQ meg", rute: "/portal/meg", bruker: SPILLER, fasitM: "playerhq-meg.html", fasitD: "playerhq-meg.html" },
  { id: "PP-1.5", navn: "PlayerHQ booking", rute: "/portal/booking", bruker: SPILLER, fasitM: "playerhq-booking.html", fasitD: "playerhq-booking.html" },
  { id: "PP-1.6", navn: "Innlogging", rute: "/auth/login", bruker: null, fasitM: "innlogging.html", fasitD: "innlogging.html" },
  { id: "PP-1.7", navn: "Booking (offentlig)", rute: "/booking", bruker: null, fasitM: "booking.html", fasitD: "booking.html" },
  { id: "PP-2.1", navn: "AgencyOS konsoll", rute: "/admin/agencyos", bruker: COACH, fasitM: "agencyos-konsoll-mobil.html", fasitD: "agencyos-konsoll-desktop.html" },
  { id: "PP-2.2", navn: "AgencyOS innboks", rute: "/admin/innboks", bruker: COACH, fasitM: "agencyos-innboks-mobil.html", fasitD: "agencyos-innboks.html" },
  { id: "PP-2.3", navn: "AgencyOS spillere", rute: "/admin/spillere", bruker: COACH, fasitM: "agencyos-spillere-mobil.html", fasitD: "agencyos-spillere.html" },
  { id: "PP-2.4", navn: "AgencyOS kalender", rute: "/admin/kalender", bruker: COACH, fasitM: "agencyos-kalender-mobil.html", fasitD: "agencyos-kalender.html" },
  // Natt 12.08 — skjermene fra PR #415–#419 (fasit i fase2/ via relativ sti)
  { id: "NT-415", navn: "Coach-hub", rute: "/portal/coach", bruker: SPILLER, fasitM: "../fase2/playerhq/playerhq-coach-hub.html", fasitD: "../fase2/playerhq/playerhq-coach-hub.html" },
  { id: "NT-416a", navn: "Planbibliotek", rute: "/admin/plan-templates", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-planbibliotek.html", fasitD: "../fase2/agencyos/agencyos-planbibliotek.html" },
  { id: "NT-416b", navn: "AgencyOS turneringer", rute: "/admin/tournaments", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-turneringer.html", fasitD: "../fase2/agencyos/agencyos-turneringer.html" },
  { id: "NT-417", navn: "Runde-logg", rute: "/portal/runde/logg", bruker: SPILLER, fasitM: "playerhq-runde-logg.html", fasitD: "playerhq-runde-logg.html" },
  { id: "NT-418a", navn: "Katalog: coacher", rute: "/coacher", bruker: null, fasitM: "../fase2/marketing/marketing-katalog.html", fasitD: "../fase2/marketing/marketing-katalog.html" },
  { id: "NT-418b", navn: "Katalog: blogg", rute: "/blogg", bruker: null, fasitM: "../fase2/marketing/marketing-katalog.html", fasitD: "../fase2/marketing/marketing-katalog.html" },
  { id: "NT-418c", navn: "System: 404", rute: "/denne-finnes-ikke-natt", bruker: null, fasitM: "../fase2/system/system-tilstander.html", fasitD: "../fase2/system/system-tilstander.html" },
  { id: "NT-419a", navn: "WANG coach-årsplan", rute: "/team-wang/coach", bruker: COACH, fasitM: "../fase2/wang/wang-coach-arsplan.html", fasitD: "../fase2/wang/wang-coach-arsplan.html" },
  { id: "NT-419b", navn: "GFGK kalender", rute: "/gfgk-junior/kalender", bruker: null, fasitM: "../fase2/gfgk/gfgk-kalender.html", fasitD: "../fase2/gfgk/gfgk-kalender.html" },
  // Natt 13.08 — drift/AgenticOS-sporet (PR #433 + #435)
  { id: "NT-433", navn: "AgenticOS-hub", rute: "/admin/agenticos", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-agenticos-hub.html", fasitD: "../fase2/agencyos/agencyos-agenticos-hub.html" },
  { id: "NT-435", navn: "Agent-detalj", rute: "/admin/agents/daily-brief", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-agent-detalj.html", fasitD: "../fase2/agencyos/agencyos-agent-detalj.html" },
  // W4-runden 13.08 — PR #437/#438/#440/#441/#442 (kjøres mot hver PRs preview-URL)
  { id: "W4-437a", navn: "Godkjenninger", rute: "/admin/godkjenninger", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-godkjenninger.html", fasitD: "../fase2/agencyos/agencyos-godkjenninger.html" },
  { id: "W4-437b", navn: "Handlingssenter", rute: "/admin/handlingssenter", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-godkjenninger.html", fasitD: "../fase2/agencyos/agencyos-godkjenninger.html" },
  { id: "W4-437c", navn: "Oppfølgingskø", rute: "/admin/queue", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-godkjenninger.html", fasitD: "../fase2/agencyos/agencyos-godkjenninger.html" },
  { id: "W4-438a", navn: "Bookinger", rute: "/admin/bookinger", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-bookinger.html", fasitD: "../fase2/agencyos/agencyos-bookinger.html" },
  { id: "W4-438b", navn: "Ny booking", rute: "/admin/bookinger/ny", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-bookinger.html", fasitD: "../fase2/agencyos/agencyos-bookinger.html" },
  { id: "W4-440a", navn: "Grupper", rute: "/admin/grupper", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-gruppe-detalj.html", fasitD: "../fase2/agencyos/agencyos-gruppe-detalj.html" },
  { id: "W4-441a", navn: "Innstillinger/Oppsett", rute: "/admin/settings", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-oppsett.html", fasitD: "../fase2/agencyos/agencyos-oppsett.html" },
  { id: "W4-441b", navn: "GDPR-kø", rute: "/admin/gdpr", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-oppsett.html", fasitD: "../fase2/agencyos/agencyos-oppsett.html" },
  { id: "W4-441c", navn: "Audit-logg", rute: "/admin/audit-log", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-oppsett.html", fasitD: "../fase2/agencyos/agencyos-oppsett.html" },
  { id: "W4-442a", navn: "Økter", rute: "/admin/okter", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-planbibliotek.html", fasitD: "../fase2/agencyos/agencyos-planbibliotek.html" },
  { id: "W4-442b", navn: "Ny planmal", rute: "/admin/plan-templates/ny", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-planbibliotek.html", fasitD: "../fase2/agencyos/agencyos-planbibliotek.html" },
  { id: "W4-442c", navn: "Ny turnering", rute: "/admin/tournaments/ny", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-turneringer.html", fasitD: "../fase2/agencyos/agencyos-turneringer.html" },
  { id: "W4-442d", navn: "Turnering-dubletter", rute: "/admin/tournaments/dubletter", bruker: COACH, fasitM: "../fase2/agencyos/agencyos-turneringer.html", fasitD: "../fase2/agencyos/agencyos-turneringer.html" },
  // Bølge 2 — 14.08, fase1-rester. Økt-/spiller-IDene er screentest-brukerens
  // (Øyvind Rohjan) i prod — kun til fotografering, ingen skriving.
  { id: "B2-liveb", navn: "Live brief", rute: "/portal/live/cmseta469002e8ubpchfgs6ef/brief", bruker: SPILLER, fasitM: "playerhq-live-brief.html", fasitD: "playerhq-live-brief.html" },
  { id: "B2-livea", navn: "Live økt (aktiv)", rute: "/portal/live/cmseta469002e8ubpchfgs6ef/active", bruker: SPILLER, fasitM: "playerhq-live-okt.html", fasitD: "playerhq-live-okt.html" },
  { id: "B2-lives", navn: "Live summary", rute: "/portal/live/cmseta1bl00278ubpcqcfio9y/summary", bruker: SPILLER, fasitM: "playerhq-live-summary.html", fasitD: "playerhq-live-summary.html" },
  { id: "B2-wb", navn: "Spiller-workbench", rute: "/admin/spillere/c7e2811d-86e1-49fe-9100-d33d5056eac2/workbench", bruker: COACH, fasitM: "workbench-mobil.html", fasitD: "workbench-desktop.html" },
  { id: "B2-fangst", navn: "FangstSheet", rute: "/portal", bruker: SPILLER, klikk: 'button[aria-label="Fang en observasjon"]', fasitM: "fangstsheet.html", fasitD: "fangstsheet.html" },
  { id: "B2-forelder", navn: "Foreldreportal", rute: "/forelder", bruker: "screentest-parent@akgolf.test", fasitM: "foreldreportal.html", fasitD: "foreldreportal.html" },
  { id: "B3-turnering", navn: "Workbench turnering", rute: "/admin/spillere/c7e2811d-86e1-49fe-9100-d33d5056eac2/workbench?zoom=turnering", bruker: COACH, fasitM: "workbench-turnering.html", fasitD: "workbench-turnering.html" },
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
  // Dev-serveren kan bruke lang tid på første kompilering av en rute — vent tålmodig.
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

/**
 * `vindu: true` tar bare det som er synlig i vinduet, ikke hele siden.
 * Nødvendig for bunnkrom: et `position: fixed`-felt fotograferes i fullPage-modus
 * der det tilfeldigvis ligger, og siden fortsetter under det — så et fullsidebilde
 * kan aldri vise om skrivefeltet eller dokken faktisk sitter fast. Lagt inn 12.08.2026
 * etter at tre feil på rad (cookie-banner, bunndokk, konsoll-composer) alle satt i
 * bunnen og alle slapp gjennom fullsidebildene.
 */
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
  await page.close();
  return tekst;
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

for (const s of kø) {
  for (const device of ["m390", "d1280"]) {
    const fasitNavn = device === "m390" ? s.fasitM : s.fasitD;
    const appFil = `${OUT}/_raw-${s.id}-${device}-app.png`;
    const fasitFil = `${OUT}/_raw-${s.id}-${device}-fasit.png`;
    try {
      const ctx = await hentKontekst(device, "light", s.bruker);
      if (!ctx) { logg.push(`FEIL  ${s.id} ${device} — innlogging feilet`); continue; }
      const tekst = await appShot(ctx, s.rute, appFil, { klikk: s.klikk });
      await appShot(ctx, s.rute, `${OUT}/vindu-${s.id}-${device}-light.png`, { vindu: true, klikk: s.klikk });
      const harFasit = await fasitShot(ctx, fasitNavn, fasitFil);
      await sideOmSide(appFil, harFasit ? fasitFil : null, `${OUT}/${s.id}-${device}.png`, VP[device].width);
      logg.push(`OK    ${s.id} ${device.padEnd(6)} ${s.rute} — "${tekst.slice(0, 70)}"${harFasit ? "" : "  (FASIT MANGLER)"}`);
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

await writeFile(`${OUT}/_kjørelogg.txt`, logg.join("\n") + "\n");
console.log(logg.join("\n"));
console.log(`\nLagret i ${OUT}`);
