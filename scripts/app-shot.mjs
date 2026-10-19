// Logger inn som testkonto og tar full-page skjermbilder av ruter i appen.
// Kjør: node scripts/app-shot.mjs [DEVICE] [PATHS_CSV] [OUT_DIR] [BASE_URL]
//   DEVICE   = mobil | mobil360 | ipad | desktop   (default mobil = 390 px)
//   PATHS_CSV= navn:rute,navn:rute,...   (default = 5 hovedskjermer)
//   OUT_DIR  = default /tmp/akhq-app-shots-<device>
// Konto: SHOT_EMAIL (default screentest@akgolf.test). Passord: SHOT_PASSWORD eller
// SCREENTEST_PASSWORD fra .env.local. Passordet skrives aldri ut.
// For hver rute måles sidelengs rulling (scrollWidth mot clientWidth) og konsollfeil.
import { config as loadEnv } from "dotenv";
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

loadEnv({ path: ".env.local" });

const DEVICE = process.argv[2] || "mobil";
const PATHS_CSV = process.argv[3] || "home:/portal,planlegge:/portal/planlegge,gjennomfore:/portal/gjennomfore,analysere:/portal/analysere,meg:/portal/meg";
const OUT = process.argv[4] || `/tmp/akhq-app-shots-${DEVICE}`;
const BASE = process.argv[5] || "http://localhost:3000";
const EMAIL = process.env.SHOT_EMAIL || "screentest@akgolf.test";
const PASSWORD = process.env.SHOT_PASSWORD || process.env.SCREENTEST_PASSWORD;
if (!PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler i .env.local (eller sett SHOT_PASSWORD)");
  process.exit(1);
}

const VIEWPORTS = {
  mobil: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  mobil360: { width: 360, height: 800, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  ipad: { width: 834, height: 1112, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  desktop: { width: 1280, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 2 },
};
const vp = VIEWPORTS[DEVICE] || VIEWPORTS.mobil;
const SCREENS = PATHS_CSV.split(",").map((s) => {
  const i = s.indexOf(":");
  return { name: s.slice(0, i), path: s.slice(i + 1) };
});

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
await page.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });
let konsoll = [];
page.on("console", (m) => { if (m.type() === "error") konsoll.push(m.text().slice(0, 200)); });
page.on("pageerror", (e) => konsoll.push(e.message.slice(0, 200)));

// --- Innlogging (AU-01: feltene heter #le og #lp) ---
const INNE = /\/(portal|admin|forelder|team-wang|team-norway|auth\/fodselsdato)/;
await page.goto(`${BASE}/auth/login`, { waitUntil: "networkidle" });
await page.fill("#le", EMAIL);
await page.fill("#lp", PASSWORD);
await Promise.all([
  page.waitForURL(INNE, { timeout: 45000 }).catch(() => {}),
  page.click('button[type="submit"]'),
]);
await page.waitForTimeout(1500);
const url = page.url();
console.log(`[${DEVICE} ${vp.width}px] Etter innlogging: ${url.replace(BASE, "")}`);
if (!INNE.test(url)) {
  const err = await page.locator('[role="alert"]').first().innerText().catch(() => "");
  console.error(`INNLOGGING FEILET. ${err || "(ingen feilmelding)"}`);
  await page.screenshot({ path: `${OUT}/_login-fail.png`, fullPage: true });
  await browser.close();
  process.exit(1);
}

const results = [];
const maling = {};
for (const s of SCREENS) {
  konsoll = [];
  try {
    await page.goto(`${BASE}${s.path}`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {}); // prod-streaming blir aldri idle
    await page.waitForTimeout(1500);
    await page.mouse.move(0, 0); // hover-artefakter
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.addStyleTag({ content: "nextjs-portal,[data-nextjs-toast],#__next-dev-tools-indicator{display:none!important}" }).catch(() => {});
    await page.waitForTimeout(200);
    const m = await page.evaluate(() => {
      const d = document.documentElement;
      const w = d.clientWidth;
      const utenfor = [...document.querySelectorAll("body *")]
        .filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.right > w + 1 && cs.position !== "fixed" && cs.visibility !== "hidden"; })
        .slice(0, 5)
        .map((e) => `${e.tagName.toLowerCase()}.${String(e.className?.baseVal ?? e.className).split(" ")[0]}`);
      return { sidelengs: d.scrollWidth - d.clientWidth, utenfor, sluttUrl: location.pathname + location.search };
    });
    await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: true });
    maling[s.name] = { rute: s.path, ...m, konsollfeil: konsoll.slice(0, 5) };
    const flagg = [m.sidelengs > 0 ? `SIDELENGS ${m.sidelengs}px` : "", konsoll.length ? `KONSOLL ${konsoll.length}` : "", m.sluttUrl !== s.path ? `-> ${m.sluttUrl}` : ""].filter(Boolean).join(" ");
    results.push(`OK    ${s.name.padEnd(22)} ${s.path} ${flagg}`);
  } catch (e) {
    maling[s.name] = { rute: s.path, feil: e.message.split("\n")[0] };
    results.push(`FEIL  ${s.name.padEnd(22)} ${s.path}  — ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
await writeFile(`${OUT}/_maling.json`, JSON.stringify(maling, null, 2));
console.log(results.join("\n"));
console.log(`\nLagret i ${OUT}`);
