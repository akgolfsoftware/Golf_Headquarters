/**
 * Screenshotter alle redesign-skjermer via /design-cal/<slug>-wrappers (ungated, lokal dev).
 * Lagrer PNG til public/design-handover/_screens/<slug>.png for godkjennings-galleri.
 * Kjør: node scripts/shot-screens.mjs   (krever dev-server på :3000)
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000/design-cal";
const OUT = "public/design-handover/_screens";
mkdirSync(OUT, { recursive: true });

// slug, viewport (desktop=1320 / mobile=440)
const SHOTS = [
  // AgencyOS — desktop
  ["ag-dashboard", "desktop"], ["ag-stallen", "desktop"], ["ag-spiller", "desktop"],
  ["ag-workbench", "desktop"], ["ag-innboks", "desktop"], ["ag-kalender", "desktop"],
  ["ag-bookinger", "desktop"], ["ag-tester", "desktop"], ["ag-drift", "desktop"],
  ["ag-compliance", "desktop"], ["ag-compare", "desktop"], ["ag-caddie", "desktop"],
  // PlayerHQ — mobil
  ["pl-hjem", "mobile"], ["pl-workbench", "mobile"], ["pl-stats", "mobile"],
  ["pl-sghub", "mobile"], ["pl-trackman", "mobile"], ["pl-runder", "mobile"],
  ["pl-runde-ny", "mobile"], ["pl-tester", "mobile"], ["pl-drills", "mobile"],
  ["pl-drill", "mobile"], ["pl-turnering", "mobile"], ["pl-varsler", "mobile"],
  ["pl-meg", "mobile"], ["pl-innstillinger", "mobile"], ["pl-abonnement", "mobile"],
  ["pl-booking", "mobile"], ["pl-analyse", "mobile"], ["pl-aarsplan", "mobile"],
  ["pl-onboarding", "mobile"], ["pl-forelder", "mobile"],
  // Live — mobil fullscreen
  ["pl-live-brief", "mobile"], ["pl-live-active", "mobile"], ["pl-live-summary", "mobile"],
];

const VP = { desktop: { width: 1320, height: 900 }, mobile: { width: 440, height: 900 } };

const browser = await chromium.launch();
const results = [];
for (const [slug, vp] of SHOTS) {
  const ctx = await browser.newContext({ viewport: VP[vp], deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  try {
    const resp = await page.goto(`${BASE}/${slug}`, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(1200); // la lucide-ikoner + fonter settle
    await page.screenshot({ path: `${OUT}/${slug}.png`, fullPage: true });
    results.push(`OK   ${slug} (${resp?.status()})`);
  } catch (e) {
    results.push(`FEIL ${slug}: ${String(e).split("\n")[0]}`);
  }
  await ctx.close();
}
await browser.close();
console.log(results.join("\n"));
console.log(`\n${results.filter((r) => r.startsWith("OK")).length}/${SHOTS.length} screenshots OK`);
