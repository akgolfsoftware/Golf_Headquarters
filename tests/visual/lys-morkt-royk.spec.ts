/**
 * Nattlig lys/mørk-røyktest over alle produktruter (fase 1, økt 6 i «Komplett
 * designport», 05.09.2026). Kjøres av jobben `nattlig` i
 * .github/workflows/playwright.yml mot PROD — ikke i PR-CI.
 *
 * Per flate (portal/admin/forelder) × tema (lys, mørk) × bredde (390, 1280),
 * innlogget som flatens testbruker, for hver rute fra produkt-ruter.ts:
 *  1. temaet er faktisk satt — html[data-v2-tema="dark"] finnes KUN i mørk
 *     (src/app/layout.tsx setter attributtet, src/lib/v2/tema-default.ts velger)
 *  2. 0 konsollfeil / pageerror (samme støyfilter som kjerne-klikk.spec.ts)
 *  3. ingen horisontal overflyt: scrollWidth <= innerWidth + 1 (som bredde-gate.spec.ts)
 *  4. ingen tekst under 21 px i et kontrastpar som ikke holder i lys modus
 *     (scripts/check-tl-kontrast.mjs → docs/design-audit/train-lock-kontrast.md,
 *     12 brudd 03.09.2026). Åtte blokkerer: signalfarge som tekst på scene/elev
 *     (beslutningen 03.09, «Vei A»). To rapporteres: mute på dock (fasitens
 *     inaktive faner) og dim på scene (skjelett). To er utenfor: on-danger på
 *     danger er hvit tekst på fylt flate, som beslutningen tillater.
 *
 * Alle avvik for én (flate, tema, bredde) samles og rapporteres i ett — testen
 * stopper ikke ved første rute. Krever SCREENTEST_PASSWORD.
 */
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { config as loadEnv } from "dotenv";
import { FLATER, finnProduktRuter, type Flate } from "./produkt-ruter";
import { loggInn } from "../../scripts/lib/train-lock-maal.mjs";

loadEnv({ path: ".env.local" });

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "https://akgolf-hq.vercel.app";
const PASSORD = process.env.SCREENTEST_PASSWORD?.trim() ?? "";

/** Flatens testbruker — alle tre deler SCREENTEST_PASSWORD (scripts/roter-screentest-passord.ts). */
const BRUKER: Record<Flate, { epost: string; seed: string }> = {
  portal: { epost: "screentest@akgolf.test", seed: "npx tsx scripts/seed-screentest-komplett.ts" },
  admin: { epost: "coachtest@akgolf.test", seed: "npx tsx scripts/seed-screentest-coach.ts" },
  forelder: { epost: "screentest-parent@akgolf.test", seed: "npx tsx scripts/seed-screentest-parent.ts" },
};
const TEMAER = ["light", "dark"] as const;
const BREDDER = [
  { navn: "390", width: 390, height: 844 },
  { navn: "1280", width: 1280, height: 900 },
] as const;

/** Støy som ikke er ekte sidefeil (kjerne-klikk.spec.ts:26–32 + _helpers.ts:36–40). */
const IGNORERT_KONSOLL = [
  /Content Security Policy.*eval/i,
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  /favicon/i,
  /plausible|vercel insights|speed-insights/i,
  /Failed to load resource/i,
  /manifest/i,
];

/**
 * KJENTE, ÅPNE AVVIK — rute → grunn. Ruten hoppes over i sin helhet. Lista
 * skal krympe, aldri vokse; fjern linjen når ruten er fikset. Fylles fra
 * tørrkjøringen i fase 1 økt 6 (oppgave 6.4).
 */
const KJENTE_AVVIK: Record<string, string> = {};

/* Kontrastparene, lest fra tokenfila med samme regex som check-tl-kontrast.mjs:24–35. */
function lysTokens(): Record<string, string> {
  const css = readFileSync("src/styles/train-lock-tokens.css", "utf8");
  let sisteStart = -1;
  for (const m of css.matchAll(/html\[data-v2-tema="dark"\]\s*\{/g)) sisteStart = m.index;
  const lysDel = sisteStart >= 0 ? css.slice(0, sisteStart) : css;
  const ut: Record<string, string> = {};
  for (const m of lysDel.matchAll(/--tl-([a-z-]+):\s*(#[0-9A-Fa-f]{6})\b/g)) ut[m[1]] ??= m[2];
  return ut;
}
function rgb(hex: string): string {
  const n = hex.slice(1);
  return `rgb(${parseInt(n.slice(0, 2), 16)}, ${parseInt(n.slice(2, 4), 16)}, ${parseInt(n.slice(4, 6), 16)})`;
}
type Par = { navn: string; tekst: string; flate: string };
function lagPar(par: readonly (readonly [string, string])[]): Par[] {
  const t = lysTokens();
  return par.map(([tekst, flate]) => ({ navn: `${tekst} på ${flate}`, tekst: rgb(t[tekst]), flate: rgb(t[flate]) }));
}
const BLOKKERENDE = lagPar([
  ["danger", "scene"], ["danger", "elev"],
  ["ok", "scene"], ["ok", "elev"],
  ["warn", "scene"], ["warn", "elev"],
  ["viz-target", "scene"], ["viz-target", "elev"],
]);
const RAPPORT = lagPar([["mute", "dock"], ["dim", "scene"]]);

type Maal = {
  tema: string | null;
  scrollW: number;
  innerW: number;
  treff: { navn: string; tag: string; tekst: string }[];
};

/** Kjøres i nettleseren — må være selvstendig (ingen ytre variabler). */
function maalISiden(par: Par[]): Maal {
  const treff: Maal["treff"] = [];
  for (const el of Array.from(document.body.querySelectorAll("*"))) {
    const egenTekst = Array.from(el.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent ?? "")
      .join("")
      .trim();
    if (!egenTekst || !el.getClientRects().length) continue;
    const st = getComputedStyle(el);
    if (parseFloat(st.fontSize) >= 21) continue; // stor tekst er unntatt (kontrast.md)
    let bunn = "";
    for (let n: Element | null = el; n; n = n.parentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") { bunn = bg; break; }
    }
    const p = par.find((x) => x.tekst === st.color && x.flate === bunn);
    if (p) treff.push({ navn: p.navn, tag: el.tagName.toLowerCase(), tekst: egenTekst.slice(0, 40) });
  }
  return {
    tema: document.documentElement.getAttribute("data-v2-tema"),
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    treff,
  };
}

async function laLayoutSetteSeg(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

for (const flate of FLATER) {
  for (const tema of TEMAER) {
    for (const bredde of BREDDER) {
      test(`${flate} · ${tema} · ${bredde.navn}`, async ({ browser }) => {
        test.skip(!PASSORD, "SCREENTEST_PASSWORD mangler (.env.local lokalt, secret i CI)");
        const ruter = finnProduktRuter(flate).filter((r) => !KJENTE_AVVIK[r]);
        expect(ruter.length, `${flate}: fant ingen page.tsx under src/app/${flate}`).toBeGreaterThan(0);
        const mobil = bredde.width < 700;
        const ctx = await browser.newContext({
          viewport: { width: bredde.width, height: bredde.height },
          isMobile: mobil,
          hasTouch: mobil,
          deviceScaleFactor: 1,
        });
        try {
          await ctx.addCookies([{ name: "ak-v2-tema", value: tema, domain: new URL(BASE).hostname, path: "/" }]);
          await ctx.addInitScript(() => { try { localStorage.setItem("ak_cookie_consent", "all"); } catch {} });
          const ok = await loggInn(ctx, { base: BASE, epost: BRUKER[flate].epost, passord: PASSORD });
          expect(ok, `Innlogging feilet for ${BRUKER[flate].epost} — finnes kontoen i prod? Seed: ${BRUKER[flate].seed}`).toBe(true);

          const page = await ctx.newPage();
          let konsoll: string[] = [];
          page.on("console", (m) => {
            if (m.type() === "error" && !IGNORERT_KONSOLL.some((r) => r.test(m.text()))) konsoll.push(m.text());
          });
          page.on("pageerror", (e) => konsoll.push(`pageerror: ${e.message}`));

          const feil: string[] = [];
          const rapport: string[] = [];
          const par = tema === "light" ? [...BLOKKERENDE, ...RAPPORT] : []; // bruddene er i lys
          const blokkerende = new Set(BLOKKERENDE.map((p) => p.navn));
          for (const rute of ruter) {
            konsoll = [];
            let status = 0;
            try {
              const res = await page.goto(`${BASE}${rute}`, { waitUntil: "load", timeout: 60_000 });
              status = res?.status() ?? 0;
            } catch (e) {
              feil.push(`${rute}: navigasjon feilet — ${(e as Error).message.slice(0, 120)}`);
              continue;
            }
            if (status >= 400) { feil.push(`${rute}: HTTP ${status}`); continue; }
            const landet = new URL(page.url()).pathname;
            if (!landet.startsWith(`/${flate}`)) { feil.push(`${rute}: landet utenfor flaten (${landet})`); continue; }
            await laLayoutSetteSeg(page);
            const m = await page.evaluate(maalISiden, par);
            if ((m.tema === "dark") !== (tema === "dark")) {
              feil.push(`${rute}: tema ikke satt (data-v2-tema=${m.tema ?? "mangler"}, ventet ${tema})`);
            }
            if (m.scrollW > m.innerW + 1) feil.push(`${rute}: horisontal overflyt ${m.scrollW} > ${m.innerW}`);
            for (const t of m.treff) {
              (blokkerende.has(t.navn) ? feil : rapport).push(`${rute}: «${t.tekst}» (${t.tag}) i paret ${t.navn}`);
            }
            if (konsoll.length) feil.push(`${rute}: ${konsoll.length} konsollfeil — ${konsoll[0].slice(0, 160)}`);
          }
          for (const r of rapport) test.info().annotations.push({ type: "kontrast-rapport", description: r });
          test.info().annotations.push({ type: "ruter", description: `${ruter.length} ruter målt` });
          expect(feil, `${flate} · ${tema} · ${bredde.navn} — ${feil.length} avvik:\n${feil.join("\n")}`).toEqual([]);
        } finally {
          await ctx.close();
        }
      });
    }
  }
}
