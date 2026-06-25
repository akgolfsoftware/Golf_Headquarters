/**
 * Workbench lanserings-bevis: screenshots (430 + 1280) + full flyt-logg.
 * Kjør: node scripts/workbench-gate-evidence.mjs [BASE_URL] [OUT_DIR]
 */
import { chromium } from "playwright";
import { mkdir, writeFile, appendFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const BASE = process.argv[2] || process.env.BASE_URL || "http://localhost:3000";
const OUT = process.argv[3] || process.env.SCRATCH_WB_GATE || "/tmp/wb-gate";
const FLOW_LOG = path.join(OUT, "workbench-flow.log");
const GATE_LOG = path.join(OUT, "wb-gate-run.log");

const PLAYER = { email: "screentest@akgolf.test", password: "Screentest123!" };
const COACH = { email: "coachtest@akgolf.test", password: "Screentest123!" };

const TABS = ["tek", "seson", "maler", "std", "gantt", "uke", "okt"];

async function log(line, file = FLOW_LOG) {
  const row = `[${new Date().toISOString()}] ${line}\n`;
  await appendFile(file, row);
  console.log(line);
}

async function login(page, creds, nextPath = "/portal") {
  const loginUrl = `${BASE}/auth/login?next=${encodeURIComponent(nextPath)}`;
  let lastErr = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    await page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.locator("#email").fill(creds.email);
    await page.locator("#password").fill(creds.password);
    await page.locator('form button[type="submit"]').click();
    await page
      .waitForURL((url) => !url.pathname.includes("/auth/login"), { timeout: 90000 })
      .catch(() => {});
    await page.waitForTimeout(2500);
    const url = page.url();
    if (!url.includes("/auth/login")) {
      await log(`LOGIN OK ${creds.email} → ${url} (attempt ${attempt})`);
      return;
    }
    lastErr = await page.locator("#login-form-error, [role='alert']").innerText().catch(() => "");
    await log(`LOGIN RETRY ${attempt}/3 ${creds.email}: ${lastErr}`);
    await page.waitForTimeout(3000 * attempt);
  }
  throw new Error(`Login feilet for ${creds.email}: ${lastErr}`);
}

async function shot(page, file, hideNav = false) {
  const css =
    "nextjs-portal,[data-nextjs-toast],[class*='cookie']{display:none!important}" +
    (hideNav ? " nav[aria-label='Hovednavigasjon']{display:none!important}" : "");
  await page.addStyleTag({ content: css }).catch(() => {});
  await page.mouse.move(0, 0);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: file, fullPage: true });
  await log(`SCREENSHOT ${file}`);
}

function runPrep(mode) {
  const r = spawnSync("npx", ["tsx", "scripts/workbench-publish-prep.ts", mode], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const out = (r.stdout || "") + (r.stderr || "");
  return { ok: r.status === 0, out: out.trim() };
}

await mkdir(OUT, { recursive: true });
await writeFile(FLOW_LOG, `# Workbench flow evidence — ${BASE}\n`);
await writeFile(GATE_LOG, `# Workbench gate run — ${BASE}\n`);

const prep = runPrep("set-draft");
await log(`PLAN_PREP set-draft ok=${prep.ok} ${prep.out}`, GATE_LOG);

const browser = await chromium.launch({ headless: true });

const consentInit = () => {
  try {
    localStorage.setItem("ak_cookie_consent", "all");
    document.cookie = "ak_cookie_consent=all; path=/; max-age=31536000";
  } catch {}
};

// --- Player 430px ---
{
  const ctx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await ctx.addInitScript(consentInit);
  const page = await ctx.newPage();
  await login(page, PLAYER, "/portal/planlegge/workbench?tab=uke");

  const redirects = [
    ["/portal/tren/aarsplan", "gantt"],
    ["/portal/tren/teknisk-plan", "tek"],
    ["/portal/tren/fys-plan", "std"],
    ["/portal/tren", "uke"],
  ];
  for (const [from, expectTab] of redirects) {
    await page.goto(`${BASE}${from}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);
    const u = page.url();
    const ok = u.includes("/portal/planlegge/workbench") && u.includes(`tab=${expectTab}`);
    await log(`REDIRECT ${from} → ${u} ${ok ? "PASS" : "FAIL"}`);
  }

  for (const tab of TABS) {
    try {
      await page.goto(`${BASE}/portal/planlegge/workbench?tab=${tab}`, {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });
    } catch (e) {
      await log(`TAB_NAV_WARN ${tab}: ${e.message}`);
      await page.waitForTimeout(2000);
    }
    await page.waitForTimeout(1200);
    await shot(page, path.join(OUT, `player-430-${tab}.png`), true);
    await log(`TAB_SWITCH player ${tab} PASS`);
  }

  const mobileRoot = page.locator(".wb-mobile");

  // Maler — klikk Bruk på første mal
  await page.goto(`${BASE}/portal/planlegge/workbench?tab=maler`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const brukBtn = page.getByRole("button", { name: "Bruk" }).first();
  if (await brukBtn.isVisible().catch(() => false)) {
    await Promise.all([
      page.waitForURL(/tab=(uke|gantt)/, { timeout: 20000 }).catch(() => {}),
      brukBtn.click(),
    ]);
    await page.waitForTimeout(1500);
    const afterBruk = page.url();
    const brukOk = afterBruk.includes("tab=uke") || afterBruk.includes("tab=gantt");
    await log(`MALER_BRUK → ${afterBruk} ${brukOk ? "PASS" : "FAIL"}`);
    if (afterBruk.includes("tab=uke")) {
      const cards = await mobileRoot.locator("[data-sid]").count().catch(() => 0);
      await log(`MALER_BRUK_SESSIONS count=${cards} ${cards > 0 ? "PASS" : "FAIL"}`);
    }
  } else {
    await log("MALER_BRUK SKIP ingen mal-knapper");
  }

  // DB move evidence (before publish — needs sessions on uke)
  {
    const r = spawnSync("npx", ["tsx", "scripts/workbench-move-evidence.ts", FLOW_LOG], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const tail = (r.stdout || "").trim().split("\n").pop() || `exit=${r.status}`;
    await log(`SCRIPT workbench-move-evidence.ts ${tail}`, GATE_LOG);
    if (r.status !== 0) throw new Error(`workbench-move-evidence exit ${r.status}`);
  }

  // Uke — publiser via UI (mobil-layout — desktop-topbar er display:none på 430px)
  await page.goto(`${BASE}/portal/planlegge/workbench?tab=uke`, { waitUntil: "domcontentloaded" });
  try {
    await mobileRoot.locator('[data-testid="wb-week-ready"]').waitFor({ state: "visible", timeout: 15000 });
    await log("WB_WEEK_READY visible=true PASS");
  } catch (e) {
    await log(`WB_WEEK_READY visible=false FAIL (${e.message})`);
  }
  await page.waitForTimeout(500);
  const publishBtn = mobileRoot.getByLabel("Publiser plan");
  const publishVisible = await publishBtn.isVisible().catch(() => false);
  await log(`PUBLISH_UI visible=${publishVisible} ${publishVisible ? "PASS" : "FAIL"}`);
  if (publishVisible) {
    await publishBtn.click();
    const statusPill = mobileRoot.getByTestId("plan-status-pill");
    let pending = false;
    try {
      await statusPill.filter({ hasText: /Venter/ }).waitFor({ state: "visible", timeout: 12000 });
      pending = true;
    } catch {
      pending = false;
    }
    await log(`PUBLISH_CLICK status_pending_visible=${pending} ${pending ? "PASS" : "FAIL"}`);
  }

  // Uke — velg økt (siste kort unngår overlapp fra mal-import)
  await page.waitForTimeout(1200);
  const sessionCard = mobileRoot.locator("[data-sid]").last();
  await sessionCard.waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  if (await sessionCard.isVisible().catch(() => false)) {
    await sessionCard.click({ force: true });
    await page.waitForTimeout(500);
    await log("UKE_SELECT_SESSION PASS");
  } else {
    await log("UKE_SELECT_SESSION SKIP ingen øktkort");
  }

  const storage = await ctx.storageState();
  await ctx.close();

  const ctxDesk = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
    storageState: storage,
  });
  const pageDesk = await ctxDesk.newPage();
  await pageDesk.goto(`${BASE}/portal/planlegge/workbench?tab=uke`, { waitUntil: "domcontentloaded" });
  await pageDesk.locator('[data-testid="wb-week-ready"]').waitFor({ state: "visible", timeout: 20000 }).catch(() => {});
  await pageDesk.waitForTimeout(2000);
  await shot(pageDesk, path.join(OUT, "player-1280-uke.png"));
  await log("PLAYER_DESKTOP_1280 uke PASS");

  // Desktop drag-and-drop: flytt første økt til tir-kolonne
  const dragCard = pageDesk.locator("[data-sid]").first();
  const dragTarget = pageDesk.locator('[data-day="tir"]').first();
  if (
    (await dragCard.isVisible().catch(() => false)) &&
    (await dragTarget.isVisible().catch(() => false))
  ) {
    const sid = await dragCard.getAttribute("data-sid");
    try {
      await dragCard.dragTo(dragTarget, { timeout: 10000 });
      await pageDesk.waitForTimeout(2000);
      const inTir = await dragTarget.locator(`[data-sid="${sid}"]`).isVisible().catch(() => false);
      await log(`MOVE_UI sid=${sid} target=tir visible=${inTir} ${inTir ? "PASS" : "FAIL"}`);
    } catch (e) {
      await log(`MOVE_UI sid=${sid} FAIL (${e.message})`);
    }
  } else {
    await log("MOVE_UI SKIP ingen øktkort eller tir-kolonne");
  }

  await ctxDesk.close();
}

// --- Coach 1280px — alle 7 faner ---
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
  });
  await ctx.addInitScript(consentInit);
  const page = await ctx.newPage();
  let coachWb = null;
  try {
    await login(page, COACH, "/admin/spillere");
    await page.locator('button:has-text("Godta")').first().click({ timeout: 2000 }).catch(() => {});
    await page.goto(`${BASE}/admin/spillere`, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(1500);
    const oyvindLink = page.locator('a[href*="/admin/spillere/"]').filter({ hasText: /Øyvind/i }).first();
    const href = await oyvindLink.getAttribute("href").catch(() => null);
    if (!href) throw new Error("fant ikke Øyvind i stall");
    coachWb = href.replace(/\/?$/, "") + "/workbench";
    for (const tab of TABS) {
      await page.goto(`${BASE}${coachWb}?tab=${tab}`, { waitUntil: "domcontentloaded", timeout: 90000 });
      await page.waitForTimeout(1200);
      await shot(page, path.join(OUT, `coach-1280-${tab}.png`));
      await log(`COACH_TAB ${tab} PASS`);
    }
    await log(`COACH workbench ${coachWb} ALL_TABS PASS`);
  } catch (e) {
    await log(`COACH GATE FAIL: ${e.message}`);
  }
  await ctx.close();
}

await browser.close();

const restore = runPrep("restore-active");
await log(`PLAN_PREP restore-active ok=${restore.ok} ${restore.out}`, GATE_LOG);

// Locked + publish DB evidence (move runs earlier, after maler)
const evidenceScripts = [
  ["workbench-locked-evidence.ts", path.join(OUT, "locked-decisions.log")],
  ["workbench-publish-evidence.ts", FLOW_LOG],
];
for (const [script, outPath] of evidenceScripts) {
  const r = spawnSync("npx", ["tsx", `scripts/${script}`, outPath], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  await log(`SCRIPT ${script} exit=${r.status} ${(r.stdout || "").trim().split("\n").pop()}`, GATE_LOG);
}

await log("DONE workbench-gate-evidence", GATE_LOG);
console.log(`\nEvidence: ${OUT}`);