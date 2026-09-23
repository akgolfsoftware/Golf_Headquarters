/**
 * Rendertest for TN-testdetaljskjermens to visninger — dekker konkrete
 * regresjoner fra uavhengig UI-kontroll (14.09.2026):
 *  1. TnVisning krasjet på `data.historikk[0].takenAt` når ALLE rader var
 *     utelatt (antallUtelatt === historikk.length === 0).
 *  2. `lowerIsBetter: null` skal ALDRI rendres som «Høyere er bedre».
 *  3. TnOvrigVisning må vise enhet/steg/sisteForsok — ikke bare en tom
 *     historikktabell — og «ingen resultater ennå» i stedet for å late
 *     som spilleren har et resultat den ikke har.
 *
 * Ligger utenfor `src/` med vilje: kjøres av `npm run test:komponenter`
 * (uten `--conditions=react-server`, som `next/link` krever her).
 */
import { before, test, mock } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { TnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";

// TN sin `core.tsx` importerer et CSS-modul og en PNG-logo — begge krever et
// bundler-oppsett (webpack/Next) som ren `tsx`-kjøring ikke har. Mockes bort
// her, samme prinsipp som andre komponenttester mocker ikke-JS-avhengigheter.
const CORE_CSS = new URL("../../src/components/team-norway/tn-kontroller.module.css", import.meta.url).pathname;
const LOGO_PNG = new URL("../../designsystem/team-norway/assets/logo/team-norway-golf.png", import.meta.url).pathname;
mock.module(CORE_CSS, { defaultExport: {} });
const LOGO_HVIT_PNG = new URL("../../designsystem/team-norway/assets/logo/team-norway-golf-knockout-white.png", import.meta.url).pathname;
mock.module(LOGO_PNG, { defaultExport: { src: "/logo.png", width: 1, height: 1 } });
mock.module(LOGO_HVIT_PNG, { defaultExport: { src: "/logo-hvit.png", width: 1, height: 1 } });

let TnVisning: typeof import("@/app/team-norway/spiller/[spillerId]/tester/[testId]/visning").TnVisning;
let TnOvrigVisning: typeof import("@/app/team-norway/spiller/[spillerId]/tester/[testId]/visning").TnOvrigVisning;
before(async () => {
  const mod = await import("@/app/team-norway/spiller/[spillerId]/tester/[testId]/visning");
  TnVisning = mod.TnVisning;
  TnOvrigVisning = mod.TnOvrigVisning;
});

const ROUTER = {
  back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: "syntetisk",
};

function medRouter(el: ReturnType<typeof createElement>): string {
  return renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: ROUTER }, el));
}

const TILGANG: TnSpillerTilgang = {
  kontekst: { gruppe: { id: "tn-gruppe", name: "Team Norway Golf" }, rolle: "COACH", erSpiller: false, kanAdministrere: true },
  spillerId: "player-a",
  spillerNavn: "Spiller A",
};

test("TnVisning krasjer IKKE når alle rader er utelatt, og viser en synlig forklaring", () => {
  const html = medRouter(createElement(TnVisning, {
    spillerId: "player-a",
    data: {
      tilgang: TILGANG, testId: "tn-v3-putt-1-3m", protokollNavn: "Putt 1–3 m",
      lowerIsBetter: null, besteScore: null, besteFormatert: null,
      historikk: [], antallUtelatt: 3, sisteForsok: [],
    },
  }));
  assert.ok(html.includes("Ingen gyldige resultater ennå"), html);
  assert.ok(html.includes("Ingen av de lagrede radene kunne valideres"), html);
});

test("TnVisning: lowerIsBetter=null rendres ALDRI som «Høyere er bedre»", () => {
  const html = medRouter(createElement(TnVisning, {
    spillerId: "player-a",
    data: {
      tilgang: TILGANG, testId: "tn-v3-putt-1-3m", protokollNavn: "Putt 1–3 m",
      lowerIsBetter: null, besteScore: null, besteFormatert: null,
      historikk: [], antallUtelatt: 1, sisteForsok: [],
    },
  }));
  assert.ok(!html.includes("Høyere tall er bedre"), html);
  assert.ok(html.includes("ikke kjent"), html);
});

test("TnVisning: med gyldige rader vises normalt, ingen krasj, riktig retning", () => {
  const html = medRouter(createElement(TnVisning, {
    spillerId: "player-a",
    data: {
      tilgang: TILGANG, testId: "tn-v3-putt-1-3m", protokollNavn: "Putt 1–3 m",
      lowerIsBetter: true, besteScore: 40, besteFormatert: "40 slag",
      historikk: [{ id: "r1", takenAt: new Date("2026-09-10"), score: 40, unit: "slag", formatert: "40 slag", recordedByCoach: false, testdagDeltakerId: null }],
      antallUtelatt: 0, sisteForsok: [{ label: "Forsøk 1", verdi: "strokes: 2" }],
    },
  }));
  assert.ok(html.includes("Lavere tall er bedre"), html);
  assert.ok(html.includes("40 slag"));
});

test("TnOvrigVisning: uten resultater viser protokoll/steg og «ingen resultater ennå», ikke 404-liknende tomhet", () => {
  const html = medRouter(createElement(TnOvrigVisning, {
    spillerId: "player-a",
    data: {
      tilgang: TILGANG, testId: "60m-sprint", navn: "60m sprint", regel: "Tid i sekunder",
      enhet: "sek", lowerIsBetter: true,
      steg: [{ label: "60m sprint", antall: 1, target: null }],
      historikk: [], sisteForsok: [],
    },
  }));
  assert.ok(html.includes("60m sprint"));
  assert.ok(html.includes("Ingen resultater ennå"), html);
});

test("TnOvrigVisning: viser måleenhet i resultatkolonnen og Gate-forsøksrutenett når det finnes", () => {
  const html = medRouter(createElement(TnOvrigVisning, {
    spillerId: "player-a",
    data: {
      tilgang: TILGANG, testId: "putt-gate", navn: "Putt Gate", regel: "Antall OK",
      enhet: "sek", lowerIsBetter: true,
      steg: [{ label: "Putt 1", antall: 1, target: null }],
      historikk: [{ id: "r1", takenAt: new Date("2026-09-10"), score: 7.2 }],
      sisteForsok: [{ nr: 1, ok: true, side: null }, { nr: 2, ok: false, side: "V" }],
    },
  }));
  assert.ok(html.includes("7,2 sek"), html); // enhet KOBLET til resultatet, ikke bare historikk uten enhet
  assert.ok(html.includes("OK"));
  assert.ok(html.includes("Bom"));
});
