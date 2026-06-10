// Logger inn som testspiller og tar full-page skjermbilder av PlayerHQ-ruter.
// Kjør: node scripts/app-shot.mjs [DEVICE] [PATHS_CSV] [OUT_DIR] [BASE_URL]
//   DEVICE   = mobil | ipad | desktop   (default mobil)
//   PATHS_CSV= navn:rute,navn:rute,...   (default = 5 hovedskjermer)
//   OUT_DIR  = default /tmp/akhq-app-shots-<device>
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const DEVICE = process.argv[2] || "mobil";
const PATHS_CSV = process.argv[3] || "home:/portal,planlegge:/portal/planlegge,gjennomfore:/portal/gjennomfore,analysere:/portal/analysere,meg:/portal/meg";
const OUT = process.argv[4] || `/tmp/akhq-app-shots-${DEVICE}`;
const BASE = process.argv[5] || "http://localhost:3000";
const EMAIL = "screentest@akgolf.test";
const PASSWORD = "Screentest123!";

const VIEWPORTS = {
  mobil: { width: 430, height: 932, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  ipad: { width: 834, height: 1112, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  desktop: { width: 1280, height: 900, isMobile: false, hasTouch: false, deviceScaleFactor: 1 },
};
const vp = VIEWPORTS[DEVICE] || VIEWPORTS.mobil;
const SCREENS = PATHS_CSV.split(",").map((s) => { const [name, path] = s.split(":"); return { name, path }; });

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch });
await page.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });

// --- Login ---
await page.goto(`${BASE}/auth/login`, { waitUntil: "networkidle" });
await page.fill("#email", EMAIL);
await page.fill("#password", PASSWORD);
await Promise.all([
  page.waitForURL(/\/(portal|admin|forelder)/, { timeout: 30000 }).catch(() => {}),
  page.click('button[type="submit"]'),
]);
await page.waitForTimeout(1500);
const url = page.url();
console.log(`[${DEVICE} ${vp.width}px] Etter login: ${url}`);
if (!/\/(portal|admin|forelder)/.test(url)) {
  const err = await page.locator('[role="alert"]').innerText().catch(() => "");
  console.error(`LOGIN FEILET. ${err || "(ingen feilmelding)"}`);
  await page.screenshot({ path: `${OUT}/_login-fail.png`, fullPage: true });
  await browser.close();
  process.exit(1);
}

const results = [];
for (const s of SCREENS) {
  try {
    await page.goto(`${BASE}${s.path}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.addStyleTag({ content: "nextjs-portal,[data-nextjs-toast],#__next-dev-tools-indicator{display:none!important} nav[aria-label='Hovednavigasjon']{display:none!important}" }).catch(() => {});
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: true });
    const h = await page.evaluate(() => document.body.innerText.slice(0, 50).replace(/\n/g, " "));
    results.push(`OK    ${s.name.padEnd(14)} ${s.path}  — "${h}"`);
  } catch (e) {
    results.push(`FEIL  ${s.name.padEnd(14)} ${s.path}  — ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
console.log(results.join("\n"));
console.log(`\nLagret i ${OUT}`);
