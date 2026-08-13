// Engangs skjermbilder for drift-PR 13.08: agenticos-hub (AI-kost-panel),
// workspace (KommandoTask), brief, recording, meg-hub. m390 + d1280, lys + mørk.
// Gjenbruker innloggingsmønsteret fra signoff-gallery.mjs.
// Kjør: node scripts/shot-drift-2026-08-13.mjs   (krever dev-server på :3000)
import { config as loadEnv } from "dotenv";
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

loadEnv({ path: ".env.local" });

const BASE = process.env.SHOT_BASE || "http://localhost:3000";
const OUT = "screenshots/paper/drift-2026-08-13";
const PASSWORD = process.env.SHOT_PASSWORD || process.env.SCREENTEST_PASSWORD;
const COACH = "coachtest@akgolf.test";

const SCREENS = [
  { id: "agenticos", rute: "/admin/agenticos" },
  { id: "workspace", rute: "/admin/workspace" },
  { id: "brief", rute: "/admin/brief" },
  { id: "recording", rute: "/admin/recording" },
  { id: "meg", rute: "/meg" },
];
const VP = {
  m390: { width: 390, height: 844, isMobile: true, hasTouch: true },
  d1280: { width: 1280, height: 900, isMobile: false, hasTouch: false },
};
const SKJUL_DEV = "nextjs-portal,[data-nextjs-toast],#__next-dev-tools-indicator{display:none!important}";

if (!PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler i .env.local");
  process.exit(1);
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });

async function nyKontekst(device, tema) {
  const vp = VP[device];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    hasTouch: vp.hasTouch,
    deviceScaleFactor: 1,
  });
  const url = new URL(BASE);
  await ctx.addCookies([{ name: "ak-v2-tema", value: tema, domain: url.hostname, path: "/" }]);
  await ctx.addInitScript(() => {
    try { localStorage.setItem("ak_cookie_consent", "all"); } catch {}
  });
  return ctx;
}

async function loggInn(ctx) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForSelector('input[type="email"]', { timeout: 90000 });
  await page.fill('input[type="email"]', COACH);
  await page.fill('input[type="password"]', PASSWORD);
  await Promise.all([
    page.waitForURL(/\/(portal|admin|forelder)/, { timeout: 60000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(1500);
  const ok = /\/(portal|admin|forelder)/.test(page.url());
  await page.close();
  return ok;
}

const resultater = [];
for (const tema of ["light", "dark"]) {
  for (const device of ["m390", "d1280"]) {
    const ctx = await nyKontekst(device, tema);
    if (!(await loggInn(ctx))) {
      resultater.push(`FEIL innlogging (${device} ${tema})`);
      await ctx.close();
      continue;
    }
    for (const s of SCREENS) {
      const page = await ctx.newPage();
      try {
        await page.goto(`${BASE}${s.rute}`, { waitUntil: "domcontentloaded", timeout: 90000 });
        await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
        await page.waitForTimeout(1200);
        await page.addStyleTag({ content: SKJUL_DEV }).catch(() => {});
        await page.screenshot({ path: `${OUT}/${s.id}-${device}-${tema}.png`, fullPage: false });
        resultater.push(`OK   ${s.id}-${device}-${tema} (${page.url()})`);
      } catch (e) {
        resultater.push(`FEIL ${s.id}-${device}-${tema}: ${String(e).split("\n")[0]}`);
      }
      await page.close();
    }
    await ctx.close();
  }
}
await browser.close();
console.log(resultater.join("\n"));
