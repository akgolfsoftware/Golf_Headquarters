/**
 * Skjermbilde-gate for B6 (godta/avvis) — PR #604 preview.
 * Kjør: node scripts/b6-godkjenning-shots.mjs <BASE_URL> <OUT_DIR>
 */
import { config as loadEnv } from "dotenv";
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

loadEnv({ path: ".env.local" });

const BASE = process.argv[2];
const OUT = process.argv[3] || "/tmp/b6-gate";
if (!BASE) {
  console.error("Bruk: node scripts/b6-godkjenning-shots.mjs <BASE_URL> <OUT_DIR>");
  process.exit(1);
}

const PASSWORD = process.env.SCREENTEST_PASSWORD;
if (!PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler i .env.local");
  process.exit(1);
}
const PLAYER = { email: "screentest@akgolf.test", password: PASSWORD };
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

for (const [tema, temaLabel] of [["dark", "mork"], ["light", "lys"]]) {
  // --- Spiller: I dag (390px) ---
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await ctx.addInitScript((t) => {
      try { document.cookie = `ak-v2-tema=${t}; path=/; max-age=31536000`; } catch {}
    }, tema);
    const page = await ctx.newPage();
    await login(page, PLAYER, "/portal");
    await page.goto(`${BASE}/portal`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1800);
    await shot(page, path.join(OUT, `spiller-390-${temaLabel}.png`));
    await ctx.close();
  }
  // --- Spiller: I dag (1280px desktop) ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
    await ctx.addInitScript((t) => {
      try { document.cookie = `ak-v2-tema=${t}; path=/; max-age=31536000`; } catch {}
    }, tema);
    const page = await ctx.newPage();
    await login(page, PLAYER, "/portal");
    await page.goto(`${BASE}/portal`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1800);
    await shot(page, path.join(OUT, `spiller-1280-${temaLabel}.png`));
    await ctx.close();
  }
  // --- Coach: SessionInspector med godkjenningsstatus ---
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
    await ctx.addInitScript((t) => {
      try { document.cookie = `ak-v2-tema=${t}; path=/; max-age=31536000`; } catch {}
    }, tema);
    const page = await ctx.newPage();
    await login(page, COACH, "/admin/spillere");
    await page.goto(`${BASE}/admin/spillere`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    const link = page.locator('a[href*="/admin/spillere/"]').filter({ hasText: /Øyvind/i }).first();
    const href = await link.getAttribute("href").catch(() => null);
    if (!href) {
      console.log("FANT IKKE spillerlenke for coach-visning — hopper over");
    } else {
      const wbUrl = `${BASE}${href.replace(/\/?$/, "")}/workbench`;
      await page.goto(wbUrl, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
      await shot(page, path.join(OUT, `coach-uke-1280-${temaLabel}.png`));
      const card = page.getByText("Wedge-økt 40-80m").first();
      if (await card.isVisible().catch(() => false)) {
        await card.click();
        await page.waitForTimeout(1000);
        await shot(page, path.join(OUT, `coach-inspector-1280-${temaLabel}.png`));
      } else {
        console.log("FANT IKKE øktkort 'Wedge-økt 40-80m' i uke-visning — inspector ikke skjermet");
      }
    }
    await ctx.close();
  }
}

await browser.close();
console.log(`\nFerdig: ${OUT}`);
