import { before, mock, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { PlanMalDetalj } from "@/components/admin/precision/AG14MalDetalj";
import type { PlanhubData, PlanhubMal } from "@/lib/agencyos/planhub-typer";

mock.module("next/navigation", { namedExports: { useRouter: () => ({ push() {}, refresh() {} }) } });
mock.module("next/link", { defaultExport: "a" });
mock.module("@/app/admin/(legacy)/plan-templates/actions", { namedExports: {
  archiveTemplate() { throw Error("Ingen skriving under visning"); },
  unarchiveTemplate() { throw Error("Ingen skriving under visning"); },
  duplicateTemplate() { throw Error("Ingen skriving under visning"); },
} });
mock.module("@/components/admin/precision/AG14Ovelseark", { namedExports: { AG14Ovelseark: () => null } });
let Detalj: typeof import("@/components/admin/precision/AG14MalDetalj").AG14MalDetalj;
let Hub: typeof import("@/components/admin/precision/AG14PlanHubNy").AG14PlanHubNy;
before(async () => {
  ({ AG14MalDetalj: Detalj } = await import("@/components/admin/precision/AG14MalDetalj"));
  ({ AG14PlanHubNy: Hub } = await import("@/components/admin/precision/AG14PlanHubNy"));
});
const detalj: PlanMalDetalj = {
  id: "syntetisk-mal", name: "Testmal", description: null, kategori: "H", lPhase: "GRUNN",
  varighetUker: 1, ukentligOktAntall: 3, fordeling: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 1, TURN: 0 },
  anbefaltFordeling: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 1, TURN: 0 },
  minAlder: null, maxAlder: null, approved: true, usageCount: 3, sessions: [],
};
test("mal-detalj forklarer manglende effektgrunnlag uten å gjøre gamle tall til karakter", () => {
  for (const gammelEffekt of [5, -5, 0]) {
    const template = { ...detalj, effectivenessAvg: gammelEffekt };
    const html = renderToStaticMarkup(createElement(Detalj, { template }));
    assert.match(html, /Dokumentert effekt/);
    assert.match(html, /Grunnlaget er ikke godkjent/);
    assert.doesNotMatch(html, /[0-5](?:,[0-9])?\/5|SG-Total-delta|effekt-historikk/);
    assert.match(html, /Rediger struktur/);
    assert.match(html, /Dupliser/);
    assert.match(html, /Arkiver/);
  }
});
test("maloversikt viser bruk og malstatus, ikke gamle spillerbaserte effektsummer", () => {
  const mal: PlanhubMal = {
    id: "syntetisk-mal", navn: "Testmal", beskrivelse: null, kategori: "H", fase: "GRUNN",
    varighetUker: 1, ukentligOktAntall: 3, usageCount: 3, oktAntall: 0, godkjent: false,
    fordeling: [], minutter: [], ukeOversikt: [],
  };
  const data: PlanhubData = {
    uke: { nr: 1, spillere: 0, okter: 0, udekket: 0 }, workbenchHref: "/admin/spillere",
    ukemaler: [{ ...mal, ...{ effektAvg: 0.42, effektAntall: 3 } }], program: [], standardokter: [], ovelser: [], ovelserTotalt: 0,
  };
  const html = renderToStaticMarkup(createElement(Hub, { data }));
  assert.match(html, /Testmal/);
  assert.match(html, /Brukt 3 ganger/);
  assert.doesNotMatch(html, /SG-total|fullførte planer|0[.,]42/);
});
