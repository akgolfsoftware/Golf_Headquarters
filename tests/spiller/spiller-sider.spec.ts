/**
 * Røyktest av alle spillersider under /portal, som voksen og som junior (13 år),
 * på mobil (390) og desktop (1280). Kun lesing: navigerer, lagrer ingenting.
 * Sidene hentes fra filsystemet (src/app/portal), uten dynamiske ruter.
 * Funn skrives til test-results/spiller-funn/funn-<persona>-<bredde>.json og skjermbilder
 * til test-results/spiller-funn/bilder/.
 */
import { test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { loginWith } from "../e2e/_auth-helpers";
import { PERSONAS, passord } from "./_personas";

const ROOT = path.join(process.cwd(), "src/app/portal");
const UT = path.join(process.cwd(), "test-results/spiller-funn");

function finnRuter(dir: string, prefix = ""): string[] {
  const ut: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      const gruppe = /^\(.*\)$/.test(e.name);
      if (e.name.startsWith("[") || e.name.startsWith("@") || e.name === "api") continue;
      ut.push(...finnRuter(path.join(dir, e.name), gruppe ? prefix : `${prefix}/${e.name}`));
    } else if (e.name === "page.tsx") {
      ut.push(prefix || "");
    }
  }
  return ut;
}

/** Sider som sender videre etter lasting river ned konteksten midt i målingen: prøv på nytt. */
async function medForsok<T>(page: import("@playwright/test").Page, fn: () => Promise<T>): Promise<T> {
  let siste: unknown;
  for (let i = 0; i < 4; i++) {
    try {
      return await fn();
    } catch (e) {
      siste = e;
      await page.waitForLoadState("load", { timeout: 15_000 }).catch(() => undefined);
      await page.waitForTimeout(700);
    }
  }
  throw siste;
}

const RUTER = [...new Set(finnRuter(ROOT).map((r) => `/portal${r}`))].sort();

const STOY = [
  /Content Security Policy.*eval/i,
  /React DevTools/i,
  /\[Fast Refresh\]/i,
  /favicon/i,
  /plausible|insights|speed-insights/i,
  /Failed to load resource.*(401|403)/i,
];

const BREDDER = [
  { navn: "390", width: 390, height: 844 },
  { navn: "1280", width: 1280, height: 800 },
];

type Funn = {
  rute: string;
  endeligUrl: string;
  status: number | null;
  problemer: string[];
};

for (const persona of PERSONAS) {
  for (const b of BREDDER) {
    test(`${persona.id} ${b.navn}px: alle spillersider`, async ({ browser }) => {
      test.skip(!passord(), "SCREENTEST_PASSWORD mangler");
      const ctx = await browser.newContext({ viewport: { width: b.width, height: b.height } });
      const page = await ctx.newPage();
      await loginWith(page, persona.email, passord());

      fs.mkdirSync(path.join(UT, "bilder"), { recursive: true });
      const funn: Funn[] = [];
      let konsoll: string[] = [];
      page.on("console", (m) => {
        if (m.type() !== "error") return;
        const t = m.text();
        if (!STOY.some((r) => r.test(t))) konsoll.push(t.slice(0, 200));
      });
      page.on("pageerror", (e) => konsoll.push(`pageerror: ${e.message.slice(0, 200)}`));

      for (const rute of RUTER) {
        const problemer: string[] = [];
        konsoll = [];
        let status: number | null = null;
        try {
          const res = await page.goto(rute, { waitUntil: "load", timeout: 60_000 });
          status = res?.status() ?? null;
          await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => undefined);
          await page.waitForTimeout(800);
          if (status !== null && status >= 400) problemer.push(`HTTP ${status}`);
          const url = new URL(page.url());
          if (url.pathname.startsWith("/auth/login")) problemer.push("sendt til innlogging (tapt sesjon)");
          if (url.pathname.startsWith("/portal/meg/abonnement") && !rute.startsWith("/portal/meg/abonnement")) {
            problemer.push("låst i Gratis (sendt til abonnement)");
          }
          const tekst = await medForsok(page, () => page.evaluate(() => document.body?.innerText ?? ""));
          if (/Application error|Internal Server Error|Something went wrong|This page could not be found/i.test(tekst)) {
            problemer.push("feilside i innholdet");
          }
          if (tekst.trim().length < 20) problemer.push("nesten tom side");
          if (/\b(NaN|undefined|\[object Object\])\b/.test(tekst)) problemer.push("NaN/undefined/[object Object] i teksten");
          const over = await medForsok(page, () =>
            page.evaluate(() => {
              const el = document.documentElement;
              return el.scrollWidth - el.clientWidth;
            }),
          );
          if (over > 1) problemer.push(`sidelengs rulling (${over}px)`);
          if (konsoll.length) problemer.push(`konsollfeil: ${[...new Set(konsoll)].slice(0, 3).join(" | ")}`);
          if (problemer.length) {
            const fil = `${persona.id}-${b.navn}-${rute.replace(/\W+/g, "_")}.png`;
            await page.screenshot({ path: path.join(UT, "bilder", fil), fullPage: false });
          }
        } catch (e) {
          problemer.push(`kunne ikke åpnes: ${(e as Error).message.split("\n")[0]}`);
        }
        funn.push({ rute, endeligUrl: new URL(page.url()).pathname, status, problemer });
      }

      fs.writeFileSync(path.join(UT, `funn-${persona.id}-${b.navn}.json`), JSON.stringify(funn, null, 2));
      await ctx.close();
    });
  }
}
