/**
 * Pilot-flyt (prod): login → samtykke-UI → start recording API → dummy transcript
 * → analyze → godkjenn PlanAction → Før-kort.
 * Unngår MediaRecorder (upålitelig i headless).
 */
import { chromium } from "playwright";
import { config } from "dotenv";

config({ path: ".env.local" });

const BASE = process.env.PLAYWRIGHT_BASE_URL || "https://akgolf-hq.vercel.app";
const email = (process.env.E2E_COACH_EMAIL || "").trim();
const password = (process.env.E2E_COACH_PASSWORD || "").trim();
if (!email || !password) {
  console.error("Mangler E2E_COACH_EMAIL/PASSWORD");
  process.exit(1);
}

const log = (s) => console.log(`[pilot] ${s}`);
const steps = [];

async function dismissCookies(page) {
  const btn = page.getByRole("button", { name: /Kun nødvendige|Godta alle/i }).first();
  try {
    if (await btn.isVisible({ timeout: 2000 })) await btn.click();
  } catch {}
}

async function api(page, path, body) {
  return page.evaluate(
    async ({ path, body }) => {
      const res = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        credentials: "same-origin",
      });
      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {
        json = { raw: text.slice(0, 300) };
      }
      return { status: res.status, json };
    },
    { path, body },
  );
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: BASE });
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);

  try {
    log(`BASE ${BASE}`);
    await page.goto("/auth/login");
    await dismissCookies(page);
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/\/(portal|auth\/etter-innlogging|forelder|admin)/, { timeout: 25_000 });
    await dismissCookies(page);
    steps.push({ step: "login", ok: true });

    await page.goto("/admin/recording");
    await dismissCookies(page);
    await page.waitForSelector("select", { timeout: 15_000 });

    // Recovery-banner blokkerer idle/samtykke-UI — forkast før demo-flyt
    const forkast = page.getByRole("button", { name: /Forkast/i });
    if (await forkast.isVisible({ timeout: 2500 }).catch(() => false)) {
      log("forkaster avbrutt opptak");
      await forkast.click();
      await page.waitForTimeout(2000);
      await dismissCookies(page);
      steps.push({ step: "forkast-recovery", ok: true });
    }

    const values = await page.locator("select option").evaluateAll((opts) =>
      opts.map((o) => ({ value: o.value, text: (o.textContent || "").trim() })),
    );
    const pick =
      values.find((o) => o.value && /E2E Pilot/i.test(o.text)) ||
      values.find((o) => o.value && !/velg/i.test(o.text));
    if (!pick) throw new Error("Ingen spiller");
    await page.locator("select").selectOption(pick.value);
    await page.waitForTimeout(800);
    log(`spiller: ${pick.text}`);
    steps.push({ step: "velg-spiller", ok: true, player: pick.text, playerId: pick.value });

    // Samtykke via UI: manuell GITT (demo uten Resend/DKIM)
    const startSynlig = await page
      .getByRole("button", { name: /Start opptak/i })
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    const harGittPanel = await page
      .getByText(/Lydsamtykke GITT/i)
      .isVisible({ timeout: 1500 })
      .catch(() => false);

    if (startSynlig || harGittPanel) {
      steps.push({
        step: "samtykke-ui",
        ok: true,
        already: true,
        startSynlig,
      });
    } else {
      const manuell = page.getByRole("button", {
        name: /Manuell registrering/i,
      });
      if (await manuell.isVisible({ timeout: 4000 }).catch(() => false)) {
        await manuell.click();
        await page.waitForTimeout(400);
      }
      // Ny UI: «Registrer GITT uten e-post»; gammel: «Registrer lydsamtykke»
      const reg = page
        .getByRole("button", {
          name: /Registrer GITT uten e-post|Registrer lydsamtykke/i,
        })
        .first();
      if (!(await reg.isVisible({ timeout: 5000 }).catch(() => false))) {
        // Siste utvei: Start-knapp = samtykke OK; ellers dump knapper
        if (
          await page
            .getByRole("button", { name: /Start opptak/i })
            .isVisible({ timeout: 1500 })
            .catch(() => false)
        ) {
          steps.push({ step: "samtykke-ui", ok: true, already: true });
        } else {
          const btns = await page.getByRole("button").allTextContents();
          throw new Error(
            "Finner ikke manuell samtykke-knapp. Knapper: " +
              btns.filter(Boolean).slice(0, 20).join(" | "),
          );
        }
      } else {
        const selects = page.locator("select");
        const n = await selects.count();
        if (n >= 2) {
          await selects.nth(1).selectOption("SELV").catch(() => {});
        }
        await reg.click();
        await page.waitForTimeout(2500);
        const okEtter =
          (await page
            .getByText(/Lydsamtykke GITT|Samtykke registrert/i)
            .isVisible({ timeout: 5000 })
            .catch(() => false)) ||
          (await page
            .getByRole("button", { name: /Start opptak/i })
            .isVisible({ timeout: 3000 })
            .catch(() => false));
        steps.push({ step: "samtykke-ui", ok: okEtter, via: "manuell" });
        if (!okEtter) {
          log("advarsel: ser ikke GITT/Start — fortsetter likevel");
        }
      }
    }

    // Start recording via API (samme cookies)
    log("POST /api/recording/start");
    const startRes = await api(page, "/api/recording/start", { playerId: pick.value });
    log(`start status=${startRes.status} ${JSON.stringify(startRes.json).slice(0, 200)}`);
    if (startRes.status >= 400) {
      steps.push({ step: "recording-start", ok: false, ...startRes });
      throw new Error(`start feilet: ${startRes.status} ${JSON.stringify(startRes.json)}`);
    }
    const recordingId = startRes.json.recordingId || startRes.json.id;
    if (!recordingId) throw new Error("ingen recordingId: " + JSON.stringify(startRes.json));
    steps.push({ step: "recording-start", ok: true, recordingId });

    // Complete without chunks? may fail - try dummy path after creating empty
    log("POST complete");
    const completeRes = await api(page, "/api/recording/complete", { recordingId });
    log(`complete status=${completeRes.status}`);
    steps.push({ step: "complete", ok: completeRes.status < 500, status: completeRes.status, json: completeRes.json });

    log("POST dummy-transcript");
    const dummyRes = await api(page, "/api/recording/dummy-transcript", { recordingId });
    log(`dummy status=${dummyRes.status}`);
    steps.push({ step: "dummy-transcript", ok: dummyRes.status < 400, status: dummyRes.status, json: dummyRes.json });

    log("POST analyze (kan ta tid)");
    const analyzeRes = await api(page, "/api/recording/analyze", { recordingId });
    log(`analyze status=${analyzeRes.status} ${JSON.stringify(analyzeRes.json).slice(0, 250)}`);
    steps.push({
      step: "analyze",
      ok: analyzeRes.status < 400,
      status: analyzeRes.status,
      json: analyzeRes.json,
    });

    // Godkjenninger
    let godkjent = false;
    let koSnippet = "";
    for (let i = 0; i < 6; i++) {
      await page.goto("/admin/godkjenninger");
      await dismissCookies(page);
      await page.waitForTimeout(1200);
      koSnippet = (await page.locator("body").innerText()).slice(0, 400).replace(/\s+/g, " ");
      const godkjenn = page.getByRole("button", { name: /^Godkjenn$/i }).first();
      if (await godkjenn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await godkjenn.click();
        await page.waitForTimeout(2500);
        godkjent = true;
        log("godkjent sak");
        break;
      }
      log(`ingen Godkjenn (${i + 1}/6)`);
      await page.waitForTimeout(4000);
    }
    steps.push({ step: "godkjenn", ok: godkjent, koSnippet });

    await page.goto(`/admin/spillere/${pick.value}`);
    await dismissCookies(page);
    await page.waitForTimeout(1500);
    const bodyS = await page.locator("body").innerText();
    const harFor = /Før neste økt|Ingen godkjent sjekkpunkt|sjekkpunkt/i.test(bodyS);
    const snutt = bodyS.match(/.{0,40}(Før neste|sjekkpunkt|Ingen godkjent).{0,120}/i)?.[0];
    steps.push({ step: "for-kort", ok: harFor, snutt: snutt || bodyS.slice(0, 200).replace(/\s+/g, " ") });

    // Samlet status
    const coreOk =
      steps.find((s) => s.step === "recording-start")?.ok &&
      steps.find((s) => s.step === "for-kort")?.ok;
    steps.push({ step: "summary", ok: !!coreOk, godkjent, analyzeOk: steps.find((s) => s.step === "analyze")?.ok });
    log("FERDIG");
  } catch (e) {
    steps.push({ step: "error", ok: false, message: String(e?.message || e) });
    await page.screenshot({ path: "/tmp/pilot-flyt-fail.png", fullPage: true }).catch(() => {});
    log("FAIL");
  } finally {
    console.log(JSON.stringify({ steps }, null, 2));
    await browser.close();
  }

  const failed = steps.some((s) => s.step === "error") || !steps.find((s) => s.step === "recording-start")?.ok;
  process.exit(failed ? 1 : 0);
}

main();
