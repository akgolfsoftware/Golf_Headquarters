/**
 * Skjermbilde-gate for T13 (Oppsett + Meg) — PR #613 preview.
 * Kjør: node scripts/t13-oppsett-shots.mjs <BASE_URL> <OUT_DIR>
 */
import { config as loadEnv } from "dotenv";
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

loadEnv({ path: ".env.local" });

const BASE = process.argv[2];
const OUT = process.argv[3] || "/tmp/t13-gate";
if (!BASE) {
  console.error("Bruk: node scripts/t13-oppsett-shots.mjs <BASE_URL> <OUT_DIR>");
  process.exit(1);
}

const PASSWORD = process.env.SCREENTEST_PASSWORD;
if (!PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler i .env.local");
  process.exit(1);
}
const COACH = { email: "coachtest@akgolf.test", password: PASSWORD };

async function login(page, creds, nextPath) {
  const loginUrl = `${BASE}/auth/login?next=${encodeURIComponent(nextPath)}`;
  await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.locator("#v2login-epost").waitFor({ state: "visible", timeout: 60000 });
  await page.locator("#v2login-epost").fill(creds.email);
  await page.locator("#v2login-passord").fill(creds.password);
  await page.getByRole("button", { name: "Logg inn" }).click();
  await page.waitForURL((url) => !url.pathname.includes("/auth/login"), { timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(2000);
  console.log(`LOGIN ${creds.email} -> ${page.url()}`);
}

async function shot(page, file) {
  await page.addStyleTag({ content: "nextjs-portal,[data-nextjs-toast],[class*='cookie']{display:none!important}" }).catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`SHOT ${file}`);
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });

const ROUTES = [
  { path: "/admin/settings", name: "hub" },
  { path: "/admin/profile", name: "konto" },
];

for (const [tema, temaLabel] of [["dark", "mork"], ["light", "lys"]]) {
  for (const [width, height, size] of [[390, 844, "390"], [1280, 900, "1280"]]) {
    const isMobile = width === 390;
    const ctx = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 2,
      isMobile,
      hasTouch: isMobile,
    });
    await ctx.addInitScript((t) => {
      try { document.cookie = `ak-v2-tema=${t}; path=/; max-age=31536000`; } catch {}
    }, tema);
    const page = await ctx.newPage();
    await login(page, COACH, ROUTES[0].path);
    for (const route of ROUTES) {
      await page.goto(`${BASE}${route.path}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await shot(page, path.join(OUT, `${route.name}-${size}-${temaLabel}.png`));
    }
    await ctx.close();
  }
}

await browser.close();
console.log(`\nFerdig: ${OUT}`);
