// Logger inn som testspiller og tar full-page mobil-skjermbilder av PlayerHQ-hovedskjermene.
// Kjør: node scripts/app-shot.mjs [BASE_URL] [OUT_DIR]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.argv[2] || "http://localhost:3000";
const OUT = process.argv[3] || "/tmp/akhq-app-shots";
const EMAIL = "screentest@akgolf.test";
const PASSWORD = "Screentest123!";

const SCREENS = [
  { name: "home", path: "/portal" },
  { name: "planlegge", path: "/portal/planlegge" },
  { name: "gjennomfore", path: "/portal/gjennomfore" },
  { name: "analysere", path: "/portal/analysere" },
  { name: "meg", path: "/portal/meg" },
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
// Forhåndsgodta cookies (skjul global cookie-banner) før noen navigering.
await page.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });

// --- Login ---
await page.goto(`${BASE}/auth/login`, { waitUntil: "networkidle" });
await page.fill("#email", EMAIL);
await page.fill("#password", PASSWORD);
await Promise.all([
  page.waitForURL(/\/portal/, { timeout: 30000 }).catch(() => {}),
  page.click('button[type="submit"]'),
]);
await page.waitForTimeout(1500);
const url = page.url();
console.log(`Etter login: ${url}`);
if (!url.includes("/portal")) {
  const err = await page.locator('[role="alert"]').innerText().catch(() => "");
  console.error(`LOGIN FEILET. Feilmelding: ${err || "(ingen)"}`);
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
    // Skjul Next.js dev-overlay/issue-indikator (ikke del av skjermen).
    await page.addStyleTag({ content: "nextjs-portal,[data-nextjs-toast],#__next-dev-tools-indicator{display:none!important} nav[aria-label='Hovednavigasjon']{display:none!important}" }).catch(() => {});
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: true });
    const h = await page.evaluate(() => document.body.innerText.slice(0, 50).replace(/\n/g, " "));
    results.push(`OK    ${s.name.padEnd(12)} ${s.path}  — "${h}"`);
  } catch (e) {
    results.push(`FEIL  ${s.name.padEnd(12)} ${s.path}  — ${e.message.split("\n")[0]}`);
  }
}
await browser.close();
console.log(results.join("\n"));
console.log(`\nLagret i ${OUT}`);
