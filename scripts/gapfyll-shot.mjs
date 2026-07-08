// Skjermbilder av de skjermene gap-fyll-passet endret — for før/etter-review.
// Kjør: node scripts/gapfyll-shot.mjs <OUT_DIR> [BASE]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = process.argv[2];
const BASE = process.argv[3] || "http://localhost:3411";
const PLAYER = { email: "screentest@akgolf.test", password: "Screentest123!" };
const COACH = { email: "coachtest@akgolf.test", password: "Screentest123!" };
const PARENT = { email: "screentest-parent@akgolf.test", password: "Screentest123!" };

async function login(page, u) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: "networkidle" });
  await page.fill("#email", u.email);
  await page.fill("#password", u.password);
  await Promise.all([
    page.waitForURL(/\/(portal|admin|forelder|kommando)/, { timeout: 30000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(1500);
}
async function shoot(page, name, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(1600);
  await page.mouse.move(0, 0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.addStyleTag({ content: "nextjs-portal,[data-nextjs-toast],#__next-dev-tools-indicator{display:none!important} *{animation:none!important;transition:none!important}" }).catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log("OK", name, page.url());
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });

// Spiller: hjem (Hovedverktøy-fliser) + statistikk (StatusDot)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });
  await login(page, PLAYER);
  await shoot(page, "portal-hjem", "/portal");
  await shoot(page, "portal-statistikk", "/portal/statistikk");
  await ctx.close();
}
// Coach (mørk): agencyos-cockpit (Ett klikk-pills) + kommando (Tag warn)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addCookies([{ name: "ak-admin-theme", value: "dark", url: BASE }]);
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });
  await login(page, COACH);
  await shoot(page, "admin-agencyos", "/admin/agencyos");
  await shoot(page, "kommando", "/kommando");
  await ctx.close();
}
// Forelder: økonomi (Tag warn + KpiTile)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });
  await login(page, PARENT);
  await shoot(page, "forelder-okonomi", "/forelder/okonomi");
  await ctx.close();
}
await browser.close();
console.log("\nLagret i", OUT);
