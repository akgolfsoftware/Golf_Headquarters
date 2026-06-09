// Rendrer Claude Design PlayerHQ-prototypen og lagrer ett full-høyde skjermbilde per hovedskjerm.
// Prototypen bruker intern React-nav (useNav) — vi navigerer ved programmatisk klikk på nav (DOM .click()).
// Kjør: node scripts/design-shot.mjs [DEVICE] [OUT_DIR] [DESIGN_DIR]
//   DEVICE = mobil | desktop   (default mobil)  — iPad har ingen egen fasit
import { chromium } from "playwright";
import http from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DEVICE = process.argv[2] || "mobil";
const OUT_DIR = process.argv[3] || `/tmp/akhq-design-shots-${DEVICE}`;
const DESIGN_DIR = process.argv[4] || "/Users/anderskristiansen/Developer/akgolf-hq/public/design-handover/AK Golf HQ Design System";
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

// Bunn-tab/sidebar-rekkefølge i prototypen (SECTIONS): home, workbench, execute, analyze, me.
const SCREENS = [
  { name: "home", tab: 0 },
  { name: "planlegge", tab: 1 },
  { name: "gjennomfore", tab: 2 },
  { name: "analysere", tab: 3 },
  { name: "meg", tab: 4 },
];

const isMobil = DEVICE !== "desktop";
const NAV_SELECTOR = isMobil ? ".m-bottomnav .m-tab" : ".d-nav .d-navitem";
const UNWRAP_CSS = isMobil
  ? `
    .dev-toggle, .m-statusbar, .m-bottomnav { display: none !important; }
    .app--mobile { height: auto !important; min-height: 0 !important; display: block !important; padding: 0 !important; }
    .phone-frame { width: 430px !important; height: auto !important; max-height: none !important; border-radius: 0 !important; box-shadow: none !important; overflow: visible !important; }
    .m-scroll { overflow: visible !important; height: auto !important; }`
  : `
    .dev-toggle { display: none !important; }
    .app--desktop { height: auto !important; min-height: 100vh !important; }
    .d-main { height: auto !important; overflow: visible !important; }
    .d-scroll { overflow: visible !important; height: auto !important; }`;

const VP = isMobil ? { width: 430, height: 932 } : { width: 1280, height: 900 };

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: VP, deviceScaleFactor: 2, isMobile: isMobil, hasTouch: isMobil });
await page.addInitScript((dev) => { localStorage.setItem("ph-authed", "1"); localStorage.setItem("ph-device", dev); }, isMobil ? "mobile" : "desktop");
await page.goto(`http://localhost:${PORT}/playerhq-app/PlayerHQ.html`, { waitUntil: "networkidle" });
await page.waitForSelector(NAV_SELECTOR, { timeout: 20000 });
await page.waitForTimeout(800);

const results = [];
for (const s of SCREENS) {
  try {
    await page.evaluate(({ sel, i }) => { document.querySelectorAll(sel)[i]?.click(); }, { sel: NAV_SELECTOR, i: s.tab });
    // Workbench desktop laster en iframe — gi den ekstra tid.
    await page.waitForTimeout(s.tab === 1 && !isMobil ? 2500 : 1100);
    await page.addStyleTag({ content: UNWRAP_CSS });
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
console.log(`[${DEVICE} ${VP.width}px]`);
console.log(results.join("\n"));
console.log(`\nLagret i ${OUT_DIR}`);
