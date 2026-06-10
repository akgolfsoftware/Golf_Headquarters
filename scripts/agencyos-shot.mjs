// Rendrer AgencyOS-prototypen (fasit) og lagrer ett full-høyde skjermbilde per skjerm (mørkt tema, desktop 1280).
// Prototypen har ingen window.__ag — den deep-linker via #hash (App leser location.hash ved mount).
// Vi laster siden på nytt per skjerm med riktig hash. Speiler design-shot.mjs.
// Kjør: node scripts/agencyos-shot.mjs [DESIGN_DIR] [OUT_DIR]
import { chromium } from "playwright";
import http from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DESIGN_DIR = process.argv[2] || "/Users/anderskristiansen/Developer/akgolf-hq-agencyos/public/design-handover/AK Golf HQ Design System";
const OUT_DIR = process.argv[3] || "/tmp/ag-fasit";
const PORT = 8803;

const MIME = { ".html": "text/html", ".js": "text/javascript", ".jsx": "text/babel", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff": "font/woff", ".woff2": "font/woff2" };

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

// Alle screen-keys fra NAV + META i core.jsx (inkl. drill-down player-profile + plan-builder).
const KEYS = [
  "dashboard", "tasks", "assigned", "players", "groups", "player-profile",
  "talent-radar", "comparison", "wagr", "training-plans", "plan-builder",
  "plan-templates", "drills", "tournaments", "calendar", "bookings",
  "facilities", "availability", "services", "stable-analysis", "team-average",
  "tests", "requests", "approvals", "reports", "admin", "workbench",
];

// Strekk scroll-containere så fullPage fanger alt; skjul tweaks-panel + dev-toggle.
const UNWRAP_CSS = `
  .tweaks, .tweaks-panel, [class*='tweak'] { display: none !important; }
  html, body { height: auto !important; overflow: visible !important; }
  .app { min-height: 0 !important; align-items: flex-start !important; }
  .sidebar { height: auto !important; min-height: 100vh !important; position: static !important; }
  .topbar { position: static !important; }
  .content { overflow: visible !important; }`;

const VP = { width: 1280, height: 900 };

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: VP, deviceScaleFactor: 2 });

const baseUrl = `http://localhost:${PORT}/agencyos-app/AgencyOS%20Prototype.html`;
const results = [];
for (const key of KEYS) {
  try {
    // Unik query-param per skjerm: goto med kun endret #hash reloader ikke dokumentet,
    // og App leser location.hash bare ved mount. ?k= tvinger full reload.
    await page.goto(`${baseUrl}?k=${key}#${key}`, { waitUntil: "networkidle" });
    // Vent på at React har montert skjermen (babel-transform tar litt tid).
    await page.waitForSelector(".content", { timeout: 20000 });
    await page.waitForTimeout(900);
    await page.addStyleTag({ content: UNWRAP_CSS });
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, 0));
    const txt = await page.evaluate(() => document.body.innerText.slice(0, 60).replace(/\n/g, " "));
    const missing = txt.includes("Mangler skjerm");
    await page.screenshot({ path: path.join(OUT_DIR, `${key}.png`), fullPage: true });
    results.push(`${missing ? "MANGLER" : "OK     "}  ${key.padEnd(16)} — "${txt}"`);
  } catch (e) {
    results.push(`FEIL       ${key.padEnd(16)} — ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
server.close();
console.log(`[AgencyOS fasit ${VP.width}px]`);
console.log(results.join("\n"));
console.log(`\nLagret i ${OUT_DIR}`);
