// Rendrer Claude Design PlayerHQ-prototypen (mobil) og lagrer ett full-høyde skjermbilde per hovedskjerm.
// Den ferske prototypen bruker intern React-nav (useNav), IKKE window.__ph — vi navigerer ved å klikke bunn-tab-baren.
// Telefonrammen foldes ut (auto-høyde, ingen bezel, mock-statusbar skjult) så full-page fanger hele skjermen.
// Kjør: node scripts/design-shot.mjs [DESIGN_DIR] [OUT_DIR]
import { chromium } from "playwright";
import http from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DESIGN_DIR = process.argv[2] || "/Users/anderskristiansen/Developer/akgolf-hq/public/design-handover/AK Golf HQ Design System";
const OUT_DIR = process.argv[3] || "/tmp/akhq-design-shots";
const PORT = 8799;

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".jsx": "text/babel",
  ".css": "text/css", ".json": "application/json", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".svg": "image/svg+xml", ".woff": "font/woff", ".woff2": "font/woff2",
};

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

// Bunn-tab-rekkefølge i prototypen (SECTIONS): home, workbench, execute, analyze, me.
// Navn matcher app-shot.mjs for enkel paring.
const SCREENS = [
  { name: "home", tab: 0 },
  { name: "planlegge", tab: 1 },
  { name: "gjennomfore", tab: 2 },
  { name: "analysere", tab: 3 },
  { name: "meg", tab: 4 },
];

// Folder ut telefonrammen så hele den scrollbare skjermen kommer med i full-page.
const UNWRAP_CSS = `
  .dev-toggle { display: none !important; }
  .m-statusbar { display: none !important; }
  .app--mobile { height: auto !important; min-height: 0 !important; display: block !important; padding: 0 !important; }
  .phone-frame { width: 430px !important; height: auto !important; max-height: none !important; border-radius: 0 !important; box-shadow: none !important; overflow: visible !important; }
  .m-scroll { overflow: visible !important; height: auto !important; }
  .m-bottomnav { display: none !important; }
`;

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.addInitScript(() => { localStorage.setItem("ph-authed", "1"); localStorage.setItem("ph-device", "mobile"); });
await page.goto(`http://localhost:${PORT}/playerhq-app/PlayerHQ.html`, { waitUntil: "networkidle" });
await page.waitForSelector(".m-bottomnav .m-tab", { timeout: 20000 });
await page.waitForTimeout(800);

const results = [];
for (const s of SCREENS) {
  try {
    await page.locator(".m-bottomnav .m-tab").nth(s.tab).click();
    await page.waitForTimeout(900);
    await page.addStyleTag({ content: UNWRAP_CSS }); // re-injiser etter evt. re-render
    await page.waitForTimeout(400);
    await page.evaluate(() => window.scrollTo(0, 0));
    const txt = await page.evaluate(() => document.body.innerText.slice(0, 50).replace(/\n/g, " "));
    const missing = txt.includes("Mangler skjerm");
    await page.screenshot({ path: path.join(OUT_DIR, `${s.name}.png`), fullPage: true });
    results.push(`${missing ? "MANGLER" : "OK"}  ${s.name.padEnd(12)} — "${txt}"`);
  } catch (e) {
    results.push(`FEIL    ${s.name.padEnd(12)} — ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
server.close();
console.log(results.join("\n"));
console.log(`\nLagret i ${OUT_DIR}`);
