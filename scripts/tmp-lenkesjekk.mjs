// Lenke-revisjon for AgencyOS: besøker alle /admin-sider som innlogget coach,
// samler interne <a href>-mål, og sjekker status + endelig URL for hvert unike mål.
// Rapporterer 404/500, redirect-til-annet-sted, og døde knapper (href="#" o.l.).
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const BASE = "http://localhost:3000";
const START_SIDER = process.argv[2] ? process.argv[2].split(",") : null;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 } });
const page = await ctx.newPage();
await page.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });

await page.goto(`${BASE}/auth/login`, { waitUntil: "networkidle" });
await page.fill('input[type="email"]', "coachtest@akgolf.test");
await page.fill('input[type="password"]', "Screentest123!");
await Promise.all([page.waitForURL(/\/admin/, { timeout: 30000 }).catch(() => {}), page.click('button[type="submit"]')]);
await page.waitForTimeout(1200);

// Sider å revidere: hovedsidene fra nav + Mer + kjente hub-er
const SIDER = START_SIDER ?? [
  "/admin/agencyos", "/admin/innboks", "/admin/spillere", "/admin/planlegge",
  "/admin/kalender", "/admin/bookinger", "/admin/agencyos/uka", "/admin/analyse",
  "/admin/agencyos/okonomi", "/admin/agencyos/live", "/admin/varsler",
  "/admin/innboks-epost", "/admin/godkjenninger", "/admin/handlingssenter",
  "/admin/brief", "/admin/queue", "/admin/grupper", "/admin/spillere/ny",
  "/admin/talent", "/admin/talent/radar", "/admin/plans", "/admin/plan-templates",
  "/admin/teknisk-plan", "/admin/okter", "/admin/gjennomfore", "/admin/tournaments",
  "/admin/drills", "/admin/tester", "/admin/reports", "/admin/runder",
  "/admin/analysere/compliance", "/admin/workspace", "/admin/agencyos/caddie",
  "/admin/agents", "/admin/organisasjon", "/admin/team", "/admin/email-templates",
  "/admin/availability", "/admin/services", "/admin/settings", "/admin/anlegg",
  "/admin/stall", "/admin/kapasitet", "/admin/bookinger/ny", "/admin/okonomi",
];

const lenkerPerSide = new Map(); // side -> [hrefs]
const alleMaal = new Set();

for (const side of SIDER) {
  try {
    const resp = await page.goto(`${BASE}${side}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(600);
    const landet = new URL(page.url()).pathname;
    const status = resp?.status() ?? 0;
    const hrefs = await page.$$eval("a[href]", (as) =>
      as.map((a) => a.getAttribute("href")).filter((h) => h && (h.startsWith("/admin") || h === "#" || h === "")),
    );
    const unike = [...new Set(hrefs)];
    lenkerPerSide.set(side, { landet, status, hrefs: unike });
    unike.forEach((h) => { if (h.startsWith("/admin")) alleMaal.add(h.split("?")[0].split("#")[0]); });
  } catch (e) {
    lenkerPerSide.set(side, { landet: "TIMEOUT/FEIL", status: 0, hrefs: [], feil: String(e).slice(0, 80) });
  }
}

// Sjekk hvert unike mål: status + hvor det lander (redirect?)
const maalStatus = new Map();
for (const maal of [...alleMaal].sort()) {
  // Dynamiske ruter med cuid i seg — sjekk som de er (ekte id-er fra sidene)
  try {
    const resp = await page.goto(`${BASE}${maal}`, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(250);
    const landet = new URL(page.url()).pathname;
    const status = resp?.status() ?? 0;
    const redirected = landet !== maal;
    // 200 + samme sti = OK. Redirect kan være bevisst (alias) eller feil.
    maalStatus.set(maal, { status, landet, redirected });
  } catch (e) {
    maalStatus.set(maal, { status: 0, landet: "TIMEOUT", redirected: true, feil: String(e).slice(0, 60) });
  }
}

// Rapport
const rapport = { sider: {}, maal: {} };
for (const [side, info] of lenkerPerSide) rapport.sider[side] = info;
for (const [maal, info] of maalStatus) rapport.maal[maal] = info;
writeFileSync("/tmp/lenkesjekk.json", JSON.stringify(rapport, null, 1));

// Kort oppsummering til stdout
console.log("=== SIDER SOM IKKE LANDET DER DE SKULLE ===");
for (const [side, info] of lenkerPerSide) {
  if (info.landet !== side && !info.feil) console.log(`  ${side} → ${info.landet} (${info.status})`);
  if (info.feil) console.log(`  ${side} → FEIL: ${info.feil}`);
}
console.log("=== LENKEMÅL MED PROBLEM (404/500/timeout/redirect) ===");
for (const [maal, info] of [...maalStatus].sort()) {
  if (info.status >= 400 || info.status === 0 || info.redirected) {
    console.log(`  ${maal} → ${info.landet} (${info.status})`);
  }
}
console.log("=== DØDE href (# eller tom) per side ===");
for (const [side, info] of lenkerPerSide) {
  const dode = (info.hrefs ?? []).filter((h) => h === "#" || h === "");
  if (dode.length) console.log(`  ${side}: ${dode.length} døde href`);
}
console.log(`Full rapport: /tmp/lenkesjekk.json (${alleMaal.size} unike mål sjekket)`);
await browser.close();
