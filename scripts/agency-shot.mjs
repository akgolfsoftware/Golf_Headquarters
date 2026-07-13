// Logger inn som seedet test-coach (coachtest@akgolf.test — repoets egen
// screentest-bruker, jf. scripts/seed-screentest-coach.ts) og tar
// desktop-skjermbilder av AgencyOS-ruter. v2-login-selektorer (type-attributt,
// ikke #email/#password som gamle app-shot.mjs).
// Kjør: node scripts/agency-shot.mjs [PATHS_CSV] [OUT] [BASE]
import { config as loadEnv } from "dotenv";
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

loadEnv({ path: ".env.local" });

const PATHS_CSV = process.argv[2] || "cockpit:/admin/agencyos";
const OUT = process.argv[3] || "/tmp/agency-shots";
const BASE = process.argv[4] || "http://localhost:3000";
const EMAIL = process.env.SHOT_EMAIL || "coachtest@akgolf.test";
const PASSWORD = process.env.SHOT_PASSWORD || process.env.SCREENTEST_PASSWORD;
if (!PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler i .env.local (eller sett SHOT_PASSWORD)");
  process.exit(1);
}
const VP = { width: 1600, height: 950 };

const SCREENS = PATHS_CSV.split(",").map((s) => {
  const i = s.indexOf(":");
  return { name: s.slice(0, i), path: s.slice(i + 1) };
});

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: VP, deviceScaleFactor: 2 });
await page.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });

await page.goto(`${BASE}/auth/login`, { waitUntil: "networkidle" });
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASSWORD);
await Promise.all([
  page.waitForURL(/\/(portal|admin|forelder)/, { timeout: 30000 }).catch(() => {}),
  page.click('button[type="submit"]'),
]);
await page.waitForTimeout(1500);
console.log("Etter login:", page.url());
if (!/\/(portal|admin|forelder)/.test(page.url())) {
  console.error("LOGIN FEILET");
  await page.screenshot({ path: `${OUT}/login-feil.png` });
  await browser.close();
  process.exit(1);
}

for (const s of SCREENS) {
  await page.goto(`${BASE}${s.path}`, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: false });
  console.log(`OK ${s.name} (${page.url()})`);
}
await browser.close();
