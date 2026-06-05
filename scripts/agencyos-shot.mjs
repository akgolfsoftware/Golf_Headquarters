// Rendrer AgencyOS-prototypen og lagrer ett skjermbilde per skjerm (mørkt tema, desktop).
// Speiler design-shot.mjs. Krever window.__ag eksponert i "AgencyOS Prototype.html".
import { chromium } from "playwright";
import http from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DESIGN_DIR = process.argv[2] || "/tmp/akds";
const OUT_DIR = process.argv[3] || "/tmp/akds/_shots-ag";
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

const KEYS = [
  "dashboard", "assigned", "tasks", "players", "groups", "player-profile",
  "talent-radar", "comparison", "wagr", "training-plans", "plan-templates",
  "drills", "workbench", "tournaments", "calendar", "bookings", "availability",
  "facilities", "services", "stable-analysis", "team-average", "tests",
  "requests", "approvals", "reports", "admin",
];

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/agencyos-app/AgencyOS%20Prototype.html`, { waitUntil: "networkidle" });
await page.waitForFunction(() => !!window.__ag, null, { timeout: 20000 });
await page.addStyleTag({ content: ".tweaks,.tweaks-panel,[class*='tweak']{display:none !important}" });
await page.waitForTimeout(500);

const results = [];
for (const key of KEYS) {
  try {
    await page.evaluate((k) => window.__ag.nav.go(k), key);
    await page.waitForTimeout(800);
    await page.evaluate(() => window.scrollTo(0, 0));
    const missing = await page.evaluate(() => document.body.innerText.includes("Mangler skjerm"));
    await page.screenshot({ path: path.join(OUT_DIR, `${key}.png`), fullPage: true });
    results.push(`${missing ? "MANGLER" : "OK"}  ${key}`);
  } catch (e) {
    results.push(`FEIL    ${key}  — ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
server.close();
console.log(results.join("\n"));
