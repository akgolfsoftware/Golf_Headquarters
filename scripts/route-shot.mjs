// Porting-gate screenshot: node scripts/route-shot.mjs <rute> [bredde] [navn]
// Krever at dev-serveren kjører (npm run dev på :3000).
// Eks: node scripts/route-shot.mjs /portal 430 portal-hjem
//      node scripts/route-shot.mjs /admin/agencyos 1280 cockpit
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const route = process.argv[2] || "/";
const width = Number(process.argv[3] || 1280);
const name = (process.argv[4] || route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "root");
const base = process.env.SHOT_BASE || "http://localhost:3000";
const outDir = "shots";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 2 });
const url = base + route;
const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch((e) => {
  console.error(`feil ved lasting av ${url}: ${e.message}`);
  return null;
});
await page.waitForTimeout(1200);
const out = `${outDir}/${name}-${width}.png`;
await page.screenshot({ path: out, fullPage: true });
console.log(`${res ? "OK" : "ADVARSEL (se feil over)"} → ${out}  [${url} @ ${width}px]`);
await browser.close();
