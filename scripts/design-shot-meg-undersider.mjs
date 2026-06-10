// Fanger de 7 Meg-undersidene fra Claude Design-prototypen (full høyde).
// Nav: klikk Meg-tab → klikk KONTO-rad N (ListRow .row). Re-klikk Meg-tab mellom hver.
// Kjør: node scripts/design-shot-meg-undersider.mjs [DEVICE] [OUT_DIR]
import { chromium } from "playwright";
import http from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const DEVICE = process.argv[2] || "mobil";
const OUT_DIR = process.argv[3] || `/tmp/akhq-design-shots-${DEVICE}`;
const DESIGN_DIR = "/Users/anderskristiansen/Developer/akgolf-hq/public/design-handover/AK Golf HQ Design System";
const PORT = 8798;

const MIME = { ".html": "text/html", ".js": "text/javascript", ".jsx": "text/babel", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = http.createServer(async (req, res) => {
  try {
    const p = decodeURIComponent(req.url.split("?")[0]);
    const fp = path.join(DESIGN_DIR, p);
    if (!fp.startsWith(DESIGN_DIR) || !existsSync(fp)) { res.writeHead(404); res.end("nf"); return; }
    res.writeHead(200, { "content-type": MIME[path.extname(fp)] || "application/octet-stream" });
    res.end(await readFile(fp));
  } catch (e) { res.writeHead(500); res.end(String(e)); }
});
await new Promise((r) => server.listen(PORT, r));

// KONTO-rekkefølgen i MeScreen (rad-indeks i .row-lista på Meg-skjermen)
const SUBS = [
  { name: "meg-profil", row: 0 },
  { name: "meg-abonnement", row: 1 },
  { name: "meg-innstillinger", row: 2 },
  { name: "meg-helse", row: 3 },
  { name: "meg-utstyrsbag", row: 4 },
  { name: "meg-dokumenter", row: 5 },
  { name: "meg-help", row: 6 },
];

const isMobil = DEVICE !== "desktop";
const TAB_SEL = isMobil ? ".m-bottomnav .m-tab" : ".d-nav .d-navitem";
const UNWRAP = isMobil
  ? `.dev-toggle,.m-statusbar,.m-bottomnav{display:none!important}.app--mobile{height:auto!important;display:block!important;padding:0!important}.phone-frame{width:430px!important;height:auto!important;max-height:none!important;border-radius:0!important;box-shadow:none!important;overflow:visible!important}.m-scroll{overflow:visible!important;height:auto!important}`
  : `.dev-toggle{display:none!important}.app--desktop{height:auto!important;min-height:100vh!important}.d-main{height:auto!important;overflow:visible!important}.d-scroll{overflow:visible!important;height:auto!important}`;
const VP = isMobil ? { width: 430, height: 932 } : { width: 1280, height: 900 };

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: VP, deviceScaleFactor: 2, isMobile: isMobil, hasTouch: isMobil });
await page.addInitScript((dev) => { localStorage.setItem("ph-authed", "1"); localStorage.setItem("ph-device", dev); }, isMobil ? "mobile" : "desktop");
await page.goto(`http://localhost:${PORT}/playerhq-app/PlayerHQ.html`, { waitUntil: "networkidle" });
await page.waitForSelector(TAB_SEL, { timeout: 20000 });
await page.waitForTimeout(800);

const results = [];
for (const s of SUBS) {
  try {
    // Gå til Meg-roten (tab 4), så klikk KONTO-rad N
    await page.evaluate((sel) => { document.querySelectorAll(sel)[4]?.click(); }, TAB_SEL);
    await page.waitForTimeout(700);
    await page.evaluate((i) => { document.querySelectorAll("button.row")[i]?.click(); }, s.row);
    await page.waitForTimeout(900);
    await page.addStyleTag({ content: UNWRAP });
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, 0));
    const txt = await page.evaluate(() => document.body.innerText.slice(0, 45).replace(/\n/g, " "));
    await page.screenshot({ path: path.join(OUT_DIR, `${s.name}.png`), fullPage: true });
    results.push(`OK  ${s.name.padEnd(18)} — "${txt}"`);
  } catch (e) {
    results.push(`FEIL ${s.name.padEnd(17)} — ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
server.close();
console.log(`[${DEVICE}]`);
console.log(results.join("\n"));
console.log(`Lagret i ${OUT_DIR}`);
