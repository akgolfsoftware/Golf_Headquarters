// Rendrer Claude Design-prototypen (PlayerHQ) og lagrer ett rent skjermbilde per skjerm.
// Brukes til knapp→skjerm-godkjenningstabellen (docs/kobling-godkjenning/).
// Kjør: node scripts/design-shot.mjs [DESIGN_DIR] [OUT_DIR]
// Prototypen er statisk React+Babel (ingen auth). Vi eksponerer window.__ph i ph-shell.jsx.
import { chromium } from "playwright";
import http from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DESIGN_DIR = process.argv[2] || "/tmp/akds";
const OUT_DIR = process.argv[3] || "/tmp/akds/_shots";
const PORT = 8799;

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".jsx": "text/babel",
  ".css": "text/css", ".json": "application/json", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".svg": "image/svg+xml", ".woff": "font/woff", ".woff2": "font/woff2",
};

// --- enkel statisk server for design-mappen ---
const server = http.createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(req.url.split("?")[0]);
    const fp = path.join(DESIGN_DIR, p);
    if (!fp.startsWith(DESIGN_DIR) || !existsSync(fp)) { res.writeHead(404); res.end("nf"); return; }
    const data = await readFile(fp);
    res.writeHead(200, { "content-type": MIME[path.extname(fp)] || "application/octet-stream" });
    res.end(data);
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
await new Promise((r) => server.listen(PORT, r));

// Skjermer å fange. `nav` kjøres i nettleseren mot window.__ph.
const SCREENS = [
  { name: "home",              nav: () => window.__ph.setScreen("home") },
  { name: "live-brief",        nav: () => window.__ph.setLive({ title: "Stinger-drill · 150 m", goal: "4 av 6 innenfor 4 m" }) },
  { name: "workbench",         nav: () => window.__ph.nav.go("workbench") },
  { name: "workbench-arsplan", nav: () => window.__ph.nav.go("workbench", { mode: "arsplan" }) },
  { name: "tournaments",       nav: () => window.__ph.nav.go("tournaments") },
  { name: "tournament-detail", nav: () => window.__ph.nav.go("tournament-detail", { id: 0 }) },
  { name: "execute",           nav: () => window.__ph.nav.go("execute") },
  { name: "analyze",           nav: () => window.__ph.nav.go("analyze") },
  { name: "me",                nav: () => window.__ph.nav.go("me") },
  { name: "round-detail",      nav: () => window.__ph.nav.go("round-detail", { course: "Oslo GK" }) },
  { name: "log-round",         nav: () => window.__ph.nav.go("log-round") },
  { name: "varsler",           nav: () => window.__ph.nav.go("varsler") },
  { name: "coach-panel",       nav: () => window.__ph.setCoach({ open: true, tab: "meldinger" }) },
  // Meg-undersider
  { name: "me-profil",         nav: () => window.__ph.nav.go("me-profil") },
  { name: "me-abonnement",     nav: () => window.__ph.nav.go("me-abonnement") },
  { name: "me-innstillinger",  nav: () => window.__ph.nav.go("me-innstillinger") },
  { name: "me-helse",          nav: () => window.__ph.nav.go("me-helse") },
  { name: "me-utstyr",         nav: () => window.__ph.nav.go("me-utstyr") },
  { name: "me-dokumenter",     nav: () => window.__ph.nav.go("me-dokumenter") },
  { name: "me-hjelp",          nav: () => window.__ph.nav.go("me-hjelp") },
  // Auth + onboarding (registrert i PH_SCREENS; rendres som skjerm når authed)
  { name: "login",             nav: () => window.__ph.nav.go("login") },
  { name: "signup",            nav: () => window.__ph.nav.go("signup") },
  { name: "glemt",             nav: () => window.__ph.nav.go("glemt") },
  { name: "bankid",            nav: () => window.__ph.nav.go("bankid") },
  { name: "samtykke",          nav: () => window.__ph.nav.go("samtykke") },
  { name: "onboarding",        nav: () => window.__ph.nav.go("onboarding") },
  // Coach-skuff faner + AI-Caddie
  { name: "coach-caddie",      nav: () => window.__ph.setCoach({ open: true, tab: "caddie" }) },
];

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: 2 });
await page.addInitScript(() => localStorage.setItem("ph-authed", "1"));
await page.goto(`http://localhost:${PORT}/playerhq-app/PlayerHQ.html`, { waitUntil: "networkidle" });
await page.waitForFunction(() => !!window.__ph, null, { timeout: 20000 });
await page.evaluate(() => window.__ph.setDevice("desktop"));
// skjul flytende device-toggle så den ikke havner i bildene
await page.addStyleTag({ content: ".dev-toggle{display:none !important}" });
await page.waitForTimeout(600);

const results = [];
for (const s of SCREENS) {
  try {
    await page.evaluate(() => { try { window.__ph.setLive(null); window.__ph.setCoach({ open: false, tab: "meldinger" }); } catch {} window.scrollTo(0, 0); });
    await page.evaluate(s.nav);
    await page.waitForTimeout(900);
    await page.evaluate(() => window.scrollTo(0, 0));
    const txt = await page.evaluate(() => document.body.innerText.slice(0, 60));
    const missing = txt.includes("Mangler skjerm");
    await page.screenshot({ path: path.join(OUT_DIR, `${s.name}.png`), fullPage: true });
    results.push(`${missing ? "MANGLER" : "OK"}  ${s.name}`);
  } catch (e) {
    results.push(`FEIL    ${s.name}  — ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
server.close();
console.log(results.join("\n"));
