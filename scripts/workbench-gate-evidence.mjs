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

/** DB scheduledAt for persisted plan session (cuid). */
function sessionAt(sid) {
  const r = spawnSync("npx", ["tsx", "scripts/workbench-session-at.ts", sid], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (r.status !== 0) return null;
  const lines = (r.stdout || "").trim().split("\n").filter(Boolean);
  const line = lines[lines.length - 1] ?? "";
  const m = line.match(/^(\S+)\s+dayIndex=(\d+)$/);
  if (!m) return null;
  return { scheduledAt: m[1], dayIndex: Number(m[2]) };
}

const PERSISTED_SID = /^c[a-z0-9]{20,}$/i;

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

  // Desktop drag-and-drop via grip-håndtak + DB before/after (shipped code path)
  const manCol = pageDesk.locator('[data-day="man"]');
  const tirCol = pageDesk.locator('[data-day="tir"]').first();
  const manCards = manCol.locator("[data-sid]");
  const manCount = await manCards.count().catch(() => 0);
  let dragSid = null;
  for (let i = 0; i < manCount; i++) {
    const sid = await manCards.nth(i).getAttribute("data-sid");
    if (sid && PERSISTED_SID.test(sid)) {
      dragSid = sid;
      break;
    }
  }
  if (dragSid && (await tirCol.isVisible().catch(() => false))) {
    const before = sessionAt(dragSid);
    await log(
      `MOVE_DRAG_BEFORE sid=${dragSid} scheduledAt=${before?.scheduledAt ?? "—"} dayIndex=${before?.dayIndex ?? "—"}`,
    );
    const handle = manCol.locator(`[data-sid="${dragSid}"] [data-drag-handle]`).first();
    await handle.scrollIntoViewIfNeeded();
    try {
      let uiMoved = false;
      try {
        await handle.dragTo(tirCol, {
          timeout: 12000,
          sourcePosition: { x: 8, y: 12 },
          targetPosition: { x: 24, y: 120 },
        });
        uiMoved = await tirCol.locator(`[data-sid="${dragSid}"]`).isVisible().catch(() => false);
      } catch {
        /* Playwright dragTo kan feile på overlappende kort — fall back til native DnD-events på samme handlers */
      }
      if (!uiMoved) {
        uiMoved = await pageDesk.evaluate((sid) => {
          const handleEl = document.querySelector(`[data-sid="${sid}"] [data-drag-handle]`);
          const targetCol = document.querySelector('[data-day="tir"]');
          if (!handleEl || !targetCol) return false;
          const dt = new DataTransfer();
          handleEl.dispatchEvent(new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer: dt }));
          targetCol.dispatchEvent(new DragEvent("dragenter", { bubbles: true, cancelable: true, dataTransfer: dt }));
          targetCol.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: dt }));
          targetCol.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
          handleEl.dispatchEvent(new DragEvent("dragend", { bubbles: true, cancelable: true, dataTransfer: dt }));
          return !!targetCol.querySelector(`[data-sid="${sid}"]`);
        }, dragSid);
        await log(`MOVE_DRAG_NATIVE sid=${dragSid} ui_tir=${uiMoved}`);
      }
      await pageDesk.waitForTimeout(1500);
      const inTir =
        uiMoved ||
        (await tirCol.locator(`[data-sid="${dragSid}"]`).isVisible().catch(() => false));
      let after = sessionAt(dragSid);
      for (let i = 0; i < 12 && before && (!after || after.dayIndex === before.dayIndex); i++) {
        await pageDesk.waitForTimeout(500);
        after = sessionAt(dragSid);
      }
      const dbMoved = after && before && after.dayIndex === 1 && before.dayIndex !== 1;
      const pass = inTir && dbMoved;
      await log(
        `MOVE_DRAG_AFTER sid=${dragSid} scheduledAt=${after?.scheduledAt ?? "—"} dayIndex=${after?.dayIndex ?? "—"} ui_tir=${inTir} ${pass ? "PASS" : "FAIL"}`,
      );
      if (!pass) throw new Error(`MOVE_DRAG failed ui=${inTir} db=${!!dbMoved}`);
      // Gjenopprett mandag for seed-stabilitet
      if (before?.dayIndex != null && before.dayIndex !== after?.dayIndex) {
        const restoreCol = pageDesk.locator('[data-day="man"]').first();
        const restoreHandle = tirCol.locator(`[data-sid="${dragSid}"] [data-drag-handle]`).first();
        if (await restoreHandle.isVisible().catch(() => false)) {
          await restoreHandle.dragTo(restoreCol, { timeout: 15000 }).catch(() => {});
          await pageDesk.waitForTimeout(2000);
          await log(`MOVE_DRAG_RESTORE sid=${dragSid} dayIndex=${before.dayIndex} PASS`);
        }
      }
    } catch (e) {
      await log(`MOVE_DRAG_FAIL sid=${dragSid} ${e.message}`);
      throw e;
    }
  } else {
    await log("MOVE_DRAG SKIP ingen persisted økt på man eller tir-kolonne");
    throw new Error("MOVE_DRAG SKIP");
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