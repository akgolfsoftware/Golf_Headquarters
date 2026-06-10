// Uinnloggede full-page shots av offentlige ruter. node scripts/public-shot.mjs [DEVICE] [CSV navn:rute]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
const DEVICE = process.argv[2] || "mobil";
const CSV = process.argv[3] || "forside:/";
const vp = DEVICE === "desktop" ? { width: 1280, height: 900, m: false } : DEVICE === "ipad" ? { width: 834, height: 1112, m: true } : { width: 430, height: 932, m: true };
const OUT = `/tmp/akhq-app-shots-${DEVICE}`;
await mkdir(OUT, { recursive: true });
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, isMobile: vp.m, hasTouch: vp.m });
await p.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });
for (const par of CSV.split(",")) {
  const [name, path] = par.split(":");
  try {
    await p.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle", timeout: 30000 });
    await p.waitForTimeout(900);
    await p.addStyleTag({ content: "nextjs-portal,[data-nextjs-toast],#__next-dev-tools-indicator{display:none!important}" }).catch(() => {});
    await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
    console.log(`OK ${name}`);
  } catch (e) { console.log(`FEIL ${name}: ${e.message.split("\n")[0]}`); }
}
await b.close();
