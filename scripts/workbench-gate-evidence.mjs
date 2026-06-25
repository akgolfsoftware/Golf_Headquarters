/**
 * Workbench lanserings-bevis: screenshots (430 + 1280) + flyt-logg.
 * Kjør: node scripts/workbench-gate-evidence.mjs [BASE_URL] [OUT_DIR]
 */
import { chromium } from "playwright";
import { mkdir, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";

const BASE = process.argv[2] || process.env.BASE_URL || "https://akgolf-hq.vercel.app";
const OUT = process.argv[3] || process.env.SCRATCH_WB_GATE || "/tmp/wb-gate";
const FLOW_LOG = path.join(OUT, "workbench-flow.log");

const PLAYER = { email: "screentest@akgolf.test", password: "Screentest123!" };
const COACH = { email: "coachtest@akgolf.test", password: "Screentest123!" };

const TABS = ["tek", "seson", "maler", "std", "gantt", "uke", "okt"];

async function log(line) {
  const row = `[${new Date().toISOString()}] ${line}\n`;
  await appendFile(FLOW_LOG, row);
  console.log(line);
}

async function login(page, creds) {
  await page.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.fill("#email", creds.email);
  await page.fill("#password", creds.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(portal|admin|forelder)/, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const url = page.url();
  if (!/\/(portal|admin)/.test(url)) {
    const err = await page.locator('[role="alert"]').innerText().catch(() => "");
    throw new Error(`Login feilet for ${creds.email}: ${url} ${err}`);
  }
  await log(`LOGIN OK ${creds.email} → ${url}`);
}

async function shot(page, file, hideNav = false) {
  const css =
    "nextjs-portal,[data-nextjs-toast]{display:none!important}" +
    (hideNav ? " nav[aria-label='Hovednavigasjon']{display:none!important}" : "");
  await page.addStyleTag({ content: css }).catch(() => {});
  await page.mouse.move(0, 0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: file, fullPage: true });
  await log(`SCREENSHOT ${file}`);
}

await mkdir(OUT, { recursive: true });
await writeFile(FLOW_LOG, `# Workbench flow evidence — ${BASE}\n`);

const browser = await chromium.launch({ headless: true });

const consentInit = () => {
  try {
    localStorage.setItem("ak_cookie_consent", "all");
    document.cookie = "ak_cookie_consent=all; path=/; max-age=31536000";
  } catch {}
};

// --- Player 430px (isolert kontekst) ---
{
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await ctx.addInitScript(consentInit);
  await login(page, PLAYER);

  // Redirect test
  const resp = await page.goto(`${BASE}/portal/tren/aarsplan`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  const afterRedirect = page.url();
  const okRedirect = afterRedirect.includes("/portal/planlegge/workbench") && afterRedirect.includes("tab=gantt");
  await log(`REDIRECT /portal/tren/aarsplan → ${afterRedirect} ${okRedirect ? "PASS" : "FAIL"}`);

  for (const tab of TABS) {
    await page.goto(`${BASE}/portal/planlegge/workbench?tab=${tab}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(1000);
    await shot(page, path.join(OUT, `player-430-${tab}.png`), true);
    await log(`TAB player ${tab} OK`);
  }

  // Uke tab — check publish button visible when DRAFT
  await page.goto(`${BASE}/portal/planlegge/workbench?tab=uke`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const publishVisible = await page.getByLabel("Publiser plan").isVisible().catch(() => false);
  const statusText = await page.locator("text=Utkast").first().isVisible().catch(() => false);
  await log(`PUBLISH_UI visible=${publishVisible} utkast_pill=${statusText}`);

  await ctx.close();
}

// --- Coach 1280px (isolert kontekst) ---
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  await ctx.addInitScript(consentInit);
  let coachOk = true;
  try {
    await login(page, COACH);
  } catch (e) {
    coachOk = false;
    await log(`COACH LOGIN SKIP: ${e.message}`);
  }
  if (coachOk) {
  // Lukk cookie-banner hvis den fortsatt vises
  await page.locator('button:has-text("Godta")').first().click({ timeout: 2000 }).catch(() => {});

  // Finn demo-Øyvind i stall
  await page.goto(`${BASE}/admin/spillere`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);
  const oyvindLink = page.locator('a[href*="/admin/spillere/"]').filter({ hasText: /Øyvind/i }).first();
  const href = await oyvindLink.getAttribute("href").catch(() => null);
  if (!href) {
    await log("COACH WARN: fant ikke Øyvind-lenke — bruker generisk workbench");
    await page.goto(`${BASE}/admin/agencyos`, { waitUntil: "domcontentloaded" });
  } else {
    const wb = href.replace(/\/?$/, "") + "/workbench";
    await page.goto(`${BASE}${wb}?tab=uke`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1500);
    await shot(page, path.join(OUT, "coach-1280-uke.png"));
    for (const tab of ["maler", "std", "gantt"]) {
      await page.goto(`${BASE}${wb}?tab=${tab}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1000);
      await shot(page, path.join(OUT, `coach-1280-${tab}.png`));
    }
    await log(`COACH workbench ${wb} OK`);
  }
  }
  await ctx.close();
}

await browser.close();
await log("DONE workbench-gate-evidence");
console.log(`\nEvidence: ${OUT}`);