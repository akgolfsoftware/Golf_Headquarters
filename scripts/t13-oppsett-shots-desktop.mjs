import { config as loadEnv } from "dotenv";
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

loadEnv({ path: ".env.local" });

const BASE = process.argv[2];
const OUT = process.argv[3] || "/tmp/t13-gate";
const PASSWORD = process.env.SCREENTEST_PASSWORD;
const COACH = { email: "coachtest@akgolf.test", password: PASSWORD };

async function login(page, creds, nextPath) {
  const loginUrl = `${BASE}/auth/login?next=${encodeURIComponent(nextPath)}`;
  await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.locator("#v2login-epost").waitFor({ state: "visible", timeout: 60000 });
  await page.locator("#v2login-epost").fill(creds.email);
  await page.locator("#v2login-passord").fill(creds.password);
  // lukk evt cookie-banner som kan dekke knappen på desktop
  const godta = page.getByRole("button", { name: /godta alle|kun nødvendige/i }).first();
  if (await godta.isVisible().catch(() => false)) {
    await godta.click().catch(() => {});
    await page.waitForTimeout(300);
  }
  await page.getByRole("button", { name: "Logg inn" }).click();
  await page.waitForURL((url) => !url.pathname.includes("/auth/login"), { timeout: 90000 });
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
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript((t) => {
    try { document.cookie = `ak-v2-tema=${t}; path=/; max-age=31536000`; } catch {}
  }, tema);
  const page = await ctx.newPage();
  try {
    await login(page, COACH, ROUTES[0].path);
    for (const route of ROUTES) {
      await page.goto(`${BASE}${route.path}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await shot(page, path.join(OUT, `${route.name}-1280-${temaLabel}.png`));
    }
  } catch (e) {
    console.error(`FEIL ${temaLabel}: ${e.message}`);
    await page.screenshot({ path: path.join(OUT, `feil-1280-${temaLabel}.png`) }).catch(() => {});
  }
  await ctx.close();
}

await browser.close();
console.log(`\nFerdig: ${OUT}`);
