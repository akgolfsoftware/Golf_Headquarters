import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import type { DataGolfProps } from "@/components/portal/v2/DataGolfV2";
// Kun den uendrede historikk-komponenten erstattes; DataGolf rendres faktisk.
mock.module("@/components/portal/v2/TurneringshistorikkTrainLock", { namedExports: {
  TurneringshistorikkTrainLock: () => createElement("p", null, "Turneringshistorikk"),
} });
let DataGolfV2: typeof import("@/components/portal/v2/DataGolfV2").DataGolfV2;
before(async () => { DataGolfV2 = (await import("@/components/portal/v2/DataGolfV2")).DataGolfV2; });
import type { DataGolfKildestatus } from "@/lib/datagolf/player-tool-data";

function data(status: DataGolfKildestatus): DataGolfProps["data"] {
  return {
    proffer: [], proff: null, mot: null, egenSkill: null,
    valg: { pro: null, mot: null, runder: 24 }, proffRunder: [], motRunder: [], egneDgRunder: [],
    egne: { count: 1, score: { value: 72, count: 1 }, accuracy: { value: null, count: 0 },
      gir: { value: null, count: 0 }, from: "2026-09-01T00:00:00.000Z", to: "2026-09-01T00:00:00.000Z" },
    egneRegistrert: 1, egneKilde: "Egne registrerte runder", approach: null, motApproach: null,
    kildestatus: { profiler: status, proffRunder: null, motRunder: null, egneDgRunder: null },
    brukerTakReserve: false, kildefeil: status === "feil",
    turneringshistorikk: { aar: [], antall: 0, spennFra: null, spennTil: null, bestePlassering: null,
      medPlassering: 0, kilder: [], harHistorikk: false, tomGrunn: "Ingen importerte turneringer." },
  };
}
function render(status: DataGolfKildestatus) {
  return renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: {
    back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: "syntetisk",
  } }, createElement(SearchParamsContext.Provider, { value: new URLSearchParams() },
    createElement(DataGolfV2, { data: data(status), historikk: [{ id: "syntetisk", version: 1, tak: 7,
      name: "Proff A", slag: "innspill100", carry: 100, lie: "fairway", target: 5, unit: "m",
      source: "datagolf", sourceText: "Syntetisk referanse", inne: 4, total: 10, completedAt: "2026-09-01T00:00:00.000Z" }] }))));
}
test("manglende proffdatasett skjuler ikke egne runder og utfordringer", () => {
  const html = render("ikke-konfigurert");
  assert.ok(html.includes("Proffsammenligning er ikke tilgjengelig i denne versjonen ennå"));
  assert.ok(html.includes("72,0 slag i brutto rundesnitt"));
  assert.ok(html.includes("4/10 innenfor målet"));
  assert.ok(html.includes('href="/portal/mal/runder/ny"'));
  assert.ok(!html.includes('role="alert"'));
  assert.ok(!html.includes("dashboard"));
});
test("faktisk lesefeil gir Prøv igjen og bevarer resultater", () => {
  const html = render("feil");
  assert.ok(html.includes('role="alert"'));
  assert.ok(html.includes("Proffreferansene kunne ikke lastes"));
  assert.ok(html.includes(">Prøv igjen</button>"));
  assert.ok(html.includes("4/10 innenfor målet"));
});
test("tom referansekilde gir en normal forklaring uten feilvarsel", () => {
  const html = render("tom");
  assert.ok(html.includes("Ingen proffreferanser er lagt inn ennå"));
  assert.ok(!html.includes('role="alert"'));
});
