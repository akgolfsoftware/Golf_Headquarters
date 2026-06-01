import { chromium } from "playwright";
const OUT = "public/design-handover/_screens";
const SHOTS = [
  ["pl-booking-ny", "http://localhost:3000/design-cal/pl-booking-ny"],
  ["fo-barn", "http://localhost:3000/design-cal/fo-barn"],
];
const browser = await chromium.launch();
for (const [slug, url] of SHOTS) {
  const ctx = await browser.newContext({ viewport: { width: 440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/${slug}.png`, fullPage: true });
    console.log("OK   " + slug);
  } catch (e) { console.log("FEIL " + slug + ": " + String(e).split("\n")[0]); }
  await ctx.close();
}
await browser.close();
