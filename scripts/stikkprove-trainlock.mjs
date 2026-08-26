// Stikkprøve for Train-lock-statusmålingen 26.08.2026: fotograferer de skjermene
// token-målingen klassifiserte som PORTET (+ skallet T1 og PlayerHQ-hjem som referanse)
// mot prod, 390+1280, lys+mørk. Basert på login-/shot-mønsteret i signoff-gallery.mjs.
// Kjør: SHOT_PASSWORD=… node scripts/stikkprove-trainlock.mjs [BASE_URL]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { config } from "dotenv";

config({ path: ".env.local" });

const BASE = process.argv[2] || "https://akgolf-hq.vercel.app";
const OUT = "screenshots/trainlock-stikkprove";
const PASSWORD = process.env.SHOT_PASSWORD || process.env.SCREENTEST_PASSWORD;
const SPILLER = "screentest@akgolf.test";
const COACH = "coachtest@akgolf.test";

if (!PASSWORD) {
  console.error("SCREENTEST_PASSWORD mangler");
  process.exit(1);
}

const SHOTS = [
  { id: "t2-cockpit", rute: "/admin/agencyos", bruker: COACH },
  { id: "t1-skall-stall", rute: "/admin/spillere", bruker: COACH },
  { id: "b7-trackman-liste", rute: "/portal/analysere?fane=trackman", bruker: SPILLER },
  { id: "ph01-i-dag", rute: "/portal", bruker: SPILLER },
];
const VP = { m390: { width: 390, height: 844 }, d1280: { width: 1280, height: 900 } };

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const res = [];

for (const bruker of [COACH, SPILLER]) {
  for (const tema of ["dark", "light"]) {
    for (const [vpNavn, vp] of Object.entries(VP)) {
      const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
      const url = new URL(BASE);
      await ctx.addCookies([{ name: "ak-v2-tema", value: tema, domain: url.hostname, path: "/" }]);
      await ctx.addInitScript(() => {
        try { localStorage.setItem("ak_cookie_consent", "all"); } catch {}
      });
      // logg inn
      const p = await ctx.newPage();
      await p.goto(`${BASE}/auth/login`, { waitUntil: "domcontentloaded", timeout: 90000 });
      await p.waitForSelector('input[type="email"]', { timeout: 60000 });
      await p.fill('input[type="email"]', bruker);
      await p.fill('input[type="password"]', PASSWORD);
      await Promise.all([
        p.waitForURL(/\/(portal|admin|forelder)/, { timeout: 45000 }).catch(() => {}),
        p.click('button[type="submit"]'),
      ]);
      await p.waitForTimeout(1500);
      const inne = /\/(portal|admin)/.test(p.url());
      await p.close();
      if (!inne) {
        res.push(`FEIL innlogging ${bruker} ${tema}/${vpNavn}`);
        await ctx.close();
        continue;
      }
      for (const s of SHOTS.filter((x) => x.bruker === bruker)) {
        const page = await ctx.newPage();
        try {
          await page.goto(`${BASE}${s.rute}`, { waitUntil: "domcontentloaded", timeout: 60000 });
          await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
          await page.waitForTimeout(1500);
          await page.mouse.move(0, 0);
          const fil = `${OUT}/${s.id}-${tema}-${vpNavn}.png`;
          await page.screenshot({ path: fil, fullPage: false });
          res.push(`OK   ${fil}`);
        } catch (e) {
          res.push(`FEIL ${s.id} ${tema}/${vpNavn}: ${String(e).split("\n")[0]}`);
        }
        await page.close();
      }
      await ctx.close();
    }
  }
}
await browser.close();
console.log(res.join("\n"));
