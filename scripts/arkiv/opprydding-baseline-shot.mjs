// Baseline-skjermbilder for opprydding/token-konvergens (Fase 0 i docs/opprydding/03-opprydding-plan.md).
// Tar full-page desktop-skjermbilder av 10 nøkkelskjermer: portal (lys — PlayerHQ er alltid lys),
// admin (lys + mørk via cookie ak-admin-theme), marketing (lys).
// Kjør: node scripts/opprydding-baseline-shot.mjs [OUT_DIR] [BASE_URL]
import { config as loadEnv } from "dotenv";
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

loadEnv({ path: ".env.local" });

const OUT = process.argv[2] || "test-results/baseline";
const BASE = process.argv[3] || "http://localhost:3411";
const PASSWORD = process.env.SCREENTEST_PASSWORD;
if (!PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler i .env.local");
  process.exit(1);
}
const PLAYER = { email: "screentest@akgolf.test", password: PASSWORD };
const COACH = { email: "coachtest@akgolf.test", password: PASSWORD };

const PORTAL = [
  { name: "portal-hjem", path: "/portal" },
  // /portal/talent er utilgjengelig (self-redirect-loop i next.config.ts:94, pre-eksisterende) —
  // /portal/analysere brukes som representativ dataskjerm i stedet.
  { name: "portal-analysere", path: "/portal/analysere" },
  { name: "portal-statistikk", path: "/portal/statistikk" },
  { name: "portal-sg-hub", path: "/portal/mal/sg-hub" },
  { name: "portal-tren-kalender", path: "/portal/tren/kalender" },
];
const ADMIN = [
  { name: "admin-oversikt", path: "/admin" },
  { name: "admin-stall", path: "/admin/stall" },
  { name: "admin-workbench", path: "/admin/coach-workbench" },
  { name: "admin-analysere", path: "/admin/analysere" },
];

const VP = { width: 1280, height: 900 };
const results = [];

async function login(page, user) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: "networkidle" });
  await page.fill("#email", user.email);
  await page.fill("#password", user.password);
  await Promise.all([
    page.waitForURL(/\/(portal|admin|forelder)/, { timeout: 30000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(1500);
  if (!/\/(portal|admin|forelder)/.test(page.url())) {
    const err = await page.locator('[role="alert"]').innerText().catch(() => "");
    throw new Error(`Login feilet for ${user.email}: ${err || "(ingen feilmelding)"}`);
  }
}

async function shoot(page, screens, dir) {
  await mkdir(`${OUT}/${dir}`, { recursive: true });
  for (const s of screens) {
    try {
      await page.goto(`${BASE}${s.path}`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
      await page.waitForTimeout(1500);
      await page.mouse.move(0, 0);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.addStyleTag({ content: "nextjs-portal,[data-nextjs-toast],#__next-dev-tools-indicator{display:none!important} *{animation:none!important;transition:none!important} aside{height:auto!important;min-height:100vh!important;position:static!important} aside nav{overflow:visible!important}" }).catch(() => {});
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${OUT}/${dir}/${s.name}.png`, fullPage: true });
      const h = await page.evaluate(() => document.body.innerText.slice(0, 50).replace(/\n/g, " "));
      results.push(`OK    ${dir}/${s.name.padEnd(20)} ${s.path}  — "${h}"`);
    } catch (e) {
      results.push(`FEIL  ${dir}/${s.name.padEnd(20)} ${s.path}  — ${e.message.split("\n")[0]}`);
    }
  }
}

const browser = await chromium.launch({ headless: true });

// --- Marketing (ingen login, lys) ---
{
  const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });
  await shoot(page, [{ name: "marketing-forside", path: "/" }], "lys");
  await ctx.close();
}

// --- PlayerHQ (spiller-login, alltid lys) ---
{
  const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });
  await login(page, PLAYER);
  await shoot(page, PORTAL, "lys");
  await ctx.close();
}

// --- AgencyOS (coach-login, mørk + lys via cookie ak-admin-theme) ---
for (const theme of ["dark", "light"]) {
  const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: 2 });
  await ctx.addCookies([{ name: "ak-admin-theme", value: theme, url: BASE }]);
  const page = await ctx.newPage();
  await page.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });
  await login(page, COACH);
  await shoot(page, ADMIN, theme === "dark" ? "mork" : "lys");
  await ctx.close();
}

await browser.close();
console.log(results.join("\n"));
console.log(`\nLagret i ${OUT}`);
if (results.some((r) => r.startsWith("FEIL"))) process.exit(1);
