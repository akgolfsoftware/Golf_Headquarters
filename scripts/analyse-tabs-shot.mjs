// Skjermbilder av Analysere-fanene (klikk gjennom hver fane). For før/etter-review.
// Kjør: node scripts/analyse-tabs-shot.mjs <OUT_DIR> [BASE]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = process.argv[2];
const BASE = process.argv[3] || "http://localhost:3411";

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });
await page.goto(`${BASE}/auth/login`, { waitUntil: "networkidle" });
await page.fill("#email", "screentest@akgolf.test");
await page.fill("#password", "Screentest123!");
await Promise.all([page.waitForURL(/portal/, { timeout: 30000 }).catch(() => {}), page.click('button[type="submit"]')]);
await page.waitForTimeout(1200);
await page.goto(`${BASE}/portal/analysere`, { waitUntil: "domcontentloaded" });
await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
await page.waitForTimeout(1500);
await page.addStyleTag({ content: "nextjs-portal,[data-nextjs-toast],#__next-dev-tools-indicator{display:none!important} *{animation:none!important;transition:none!important}" }).catch(() => {});

// Klikk gjennom hver fane (role=tab) og skjermbilde
const tabs = await page.$$('[role="tab"]');
console.log(`fant ${tabs.length} faner`);
for (let i = 0; i < tabs.length; i++) {
  const label = (await tabs[i].innerText()).trim().replace(/\W+/g, "-").toLowerCase();
  await tabs[i].click();
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${OUT}/${i}-${label}.png`, fullPage: true });
  console.log("OK", label);
}
await browser.close();
console.log("Lagret i", OUT);
