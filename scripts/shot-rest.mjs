/** Screenshotter resterende OFFENTLIGE skjermer (auth/marketing/404) direkte. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "public/design-handover/_screens";
mkdirSync(OUT, { recursive: true });

const SHOTS = [
  ["au-login", "http://localhost:3000/auth/login", "mobile"],
  ["au-signup", "http://localhost:3000/auth/signup", "mobile"],
  ["au-forgot", "http://localhost:3000/auth/forgot-password", "mobile"],
  ["au-bankid", "http://localhost:3000/auth/bankid", "mobile"],
  ["au-loggetut", "http://localhost:3000/auth/logget-ut", "mobile"],
  ["mk-forside", "http://localhost:3000/", "desktop"],
  ["mx-404", "http://localhost:3000/finnes-ikke-xyz123", "desktop"],
];
const VP = { desktop: { width: 1320, height: 900 }, mobile: { width: 440, height: 900 } };

const browser = await chromium.launch();
const results = [];
for (const [slug, url, vp] of SHOTS) {
  const ctx = await browser.newContext({ viewport: VP[vp], deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/${slug}.png`, fullPage: true });
    results.push(`OK   ${slug}`);
  } catch (e) {
    results.push(`FEIL ${slug}: ${String(e).split("\n")[0]}`);
  }
  await ctx.close();
}
await browser.close();
console.log(results.join("\n"));
console.log(`\n${results.filter((r) => r.startsWith("OK")).length}/${SHOTS.length} OK`);
