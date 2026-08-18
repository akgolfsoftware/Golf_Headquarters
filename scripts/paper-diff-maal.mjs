// Måler FAKTISKE CSS-verdier i appen mot Paper-fasiten, og skriver ut avvikene som tall.
//
// Hvorfor dette finnes: porteringen har vært vurdert på øyemål i skjermbilder. «Ser ikke
// likt ut» kan ikke handles på — man vet ikke om det er skriften, luften, fargen eller
// innholdet, og man kan ikke se om en runde gjorde det bedre eller verre. Dette skriptet
// leser computed styles fra begge sider og gir et tall per egenskap.
//
// Kjør fra repo-roten (dev-server må kjøre): node scripts/paper-diff-maal.mjs [ID_CSV]
import { config as loadEnv } from "dotenv";
import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

loadEnv({ path: ".env.local" });

const BASE = process.env.SHOT_BASE || "http://localhost:3000";
const FASIT_DIR = "designsystem/paper/fase1";
const PASSWORD = process.env.SHOT_PASSWORD || process.env.SCREENTEST_PASSWORD;
const SPILLER = "screentest@akgolf.test";
const COACH = "coachtest@akgolf.test";

/** Leser SCREENS fra galleri-skriptet så listen bare finnes ett sted. */
async function lesSkjermer() {
  const kode = await readFile("scripts/signoff-gallery.mjs", "utf8");
  return [...kode.matchAll(
    /\{\s*id:\s*"([^"]+)",\s*navn:\s*"([^"]+)",\s*rute:\s*"([^"]+)",\s*bruker:\s*([^,]+),(?:[^}]*?)fasitM:\s*"([^"]+)"/g,
  )].map((m) => ({
    id: m[1], navn: m[2], rute: m[3],
    bruker: m[4].trim() === "null" ? null : m[4].trim() === "SPILLER" ? SPILLER : m[4].trim() === "COACH" ? COACH : m[4].trim().replace(/"/g, ""),
    fasit: m[5],
  }));
}

/**
 * Plukker de samme «rollene» på begge sider. Vi sammenligner ikke DOM-trær (de er
 * ulike med vilje), men hvordan de bærende rollene faktisk er stilet.
 */
const PRØVER = [
  { rolle: "sidetittel", sel: "h1" },
  { rolle: "brødtekst", sel: "p" },
  { rolle: "knapp", sel: "button, .btn, a.knapp" },
  { rolle: "kort", sel: "[class*='kort'], [class*='card'], section > div" },
];

const EGENSKAPER = ["fontFamily", "fontSize", "fontWeight", "lineHeight", "color", "backgroundColor", "borderRadius", "padding"];

async function maal(page) {
  return page.evaluate((prøver) => {
    const kort = (v) => (v || "").replace(/"/g, "").split(",")[0].trim();
    const ut = {};
    for (const { rolle, sel } of prøver) {
      const el = document.querySelector(sel);
      if (!el) { ut[rolle] = null; continue; }
      const s = getComputedStyle(el);
      ut[rolle] = {
        fontFamily: kort(s.fontFamily),
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        lineHeight: s.lineHeight,
        color: s.color,
        backgroundColor: s.backgroundColor,
        borderRadius: s.borderRadius,
        padding: s.padding,
        tekst: (el.textContent || "").trim().slice(0, 40),
      };
    }
    ut._side = {
      bakgrunn: getComputedStyle(document.body).backgroundColor,
      font: kort(getComputedStyle(document.body).fontFamily),
    };
    return ut;
  }, PRØVER);
}

const browser = await chromium.launch();
const skjermer = await lesSkjermer();
const filter = process.argv[2] ? new Set(process.argv[2].split(",")) : null;
const kø = skjermer.filter((s) => !filter || filter.has(s.id));

const ctxCache = new Map();
async function hentCtx(bruker) {
  const nøkkel = bruker ?? "anon";
  if (ctxCache.has(nøkkel)) return ctxCache.get(nøkkel);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addCookies([{ name: "ak-v2-tema", value: "light", domain: new URL(BASE).hostname, path: "/" }]);
  await ctx.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });
  if (bruker) {
    const p = await ctx.newPage();
    await p.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await p.waitForSelector('input[type="email"]', { timeout: 90000 });
    await p.fill('input[type="email"]', bruker);
    await p.fill('input[type="password"]', PASSWORD);
    await Promise.all([p.waitForURL(/\/(portal|admin|forelder)/, { timeout: 45000 }).catch(() => {}), p.click('button[type="submit"]')]);
    await p.close();
  }
  ctxCache.set(nøkkel, ctx);
  return ctx;
}

const rader = [];
for (const s of kø) {
  try {
    const ctx = await hentCtx(s.bruker);

    const appSide = await ctx.newPage();
    await appSide.goto(`${BASE}${s.rute}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await appSide.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await appSide.waitForTimeout(900);
    const app = await maal(appSide);
    await appSide.close();

    const fasitSide = await ctx.newPage();
    await fasitSide.goto(`file://${path.resolve(FASIT_DIR, s.fasit)}`, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
    await fasitSide.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
    await fasitSide.waitForTimeout(400);
    const fasit = await maal(fasitSide);
    await fasitSide.close();

    rader.push({ id: s.id, navn: s.navn, app, fasit });
    console.log(`målt  ${s.id}`);
  } catch (e) {
    console.log(`FEIL  ${s.id} — ${String(e.message).split("\n")[0]}`);
  }
}
await browser.close();

// ---- Rapport ----
const avvikTeller = {};
const linjer = [];
for (const r of rader) {
  const funn = [];
  for (const { rolle } of PRØVER) {
    const a = r.app[rolle], f = r.fasit[rolle];
    if (!a || !f) continue;
    for (const e of EGENSKAPER) {
      if (a[e] !== f[e]) {
        funn.push(`  ${rolle}.${e}: app «${a[e]}» vs fasit «${f[e]}»`);
        avvikTeller[`${rolle}.${e}`] = (avvikTeller[`${rolle}.${e}`] || 0) + 1;
      }
    }
  }
  if (r.app._side.bakgrunn !== r.fasit._side.bakgrunn) {
    funn.push(`  side.bakgrunn: app «${r.app._side.bakgrunn}» vs fasit «${r.fasit._side.bakgrunn}»`);
    avvikTeller["side.bakgrunn"] = (avvikTeller["side.bakgrunn"] || 0) + 1;
  }
  linjer.push(`### ${r.id} — ${r.navn}\n${funn.length ? funn.join("\n") : "  ingen avvik i de målte rollene"}`);
}

const topp = Object.entries(avvikTeller).sort((a, b) => b[1] - a[1]);
const rapport = [
  `# Målte Paper-avvik — ${rader.length} skjermer`,
  ``,
  `## Hyppigste avvik (antall skjermer)`,
  ...topp.map(([k, v]) => `- ${v} × ${k}`),
  ``,
  `## Per skjerm`,
  ...linjer,
].join("\n");

await writeFile("screenshots/paper/diff-maal.md", rapport);
console.log(`\n=== TOPP AVVIK ===`);
for (const [k, v] of topp.slice(0, 12)) console.log(`${String(v).padStart(3)} × ${k}`);
console.log(`\nSkrev screenshots/paper/diff-maal.md`);
