import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
mock.module("server-only", { defaultExport: {} });
mock.module("@/components/team-norway/core", {
  namedExports: { TnLogo: () => createElement("span", null, "Team Norway") },
});

let DelingSamtykkeKort: typeof import("@/components/portal/v2/DelingSamtykkeKort").DelingSamtykkeKort;
let TnSamtykkeSide: typeof import("@/components/portal/v2/TnSamtykkeSide").TnSamtykkeSide;
before(async () => {
  ({ DelingSamtykkeKort } = await import("@/components/portal/v2/DelingSamtykkeKort"));
  ({ TnSamtykkeSide } = await import("@/components/portal/v2/TnSamtykkeSide"));
});

test("WANG-elev ser automatisk testdeling adskilt fra frivillige brytere", () => {
  const html = renderToStaticMarkup(createElement(DelingSamtykkeKort, {
    automatiskWangTestdeling: true,
    grupper: [{
      gruppeId: "team-norway-syntetisk",
      gruppeNavn: "Team Norway",
      testResultater: false,
      stats: false,
      testResultaterAutomatisk: true,
    }],
    modus: { type: "spiller" },
  }));

  assert.ok(html.includes("Testresultater deles automatisk"), html);
  assert.ok(html.includes("Frivillig deling"), html);
  assert.ok(html.includes("kan ikke slås av her"), html);
  assert.equal((html.match(/role="switch"/g) ?? []).length, 1, html);
});

test("automatisk deling vises selv om ingen frivillig mottakergruppe er aktiv", () => {
  const html = renderToStaticMarkup(createElement(DelingSamtykkeKort, {
    automatiskWangTestdeling: true,
    grupper: [],
    modus: { type: "foresatt", childId: "syntetisk-barn" },
  }));

  assert.ok(html.includes("Testresultater fra aktive WANG-elever deles automatisk"), html);
  assert.ok(html.includes("vises separat"), html);
  assert.ok(!html.includes("Ingenting deles uten"), html);
});

test("Team Norway-samtykkesiden låser bare testresultater for aktive WANG-elever", () => {
  const html = renderToStaticMarkup(createElement(TnSamtykkeSide, {
    automatiskWangTestdeling: true,
    organisasjoner: [{
      gruppeId: "team-norway-syntetisk",
      navn: "Team Norway",
      testerOgResultater: false,
      stats: false,
      testResultaterAutomatisk: true,
      komplettProfil: false,
    }],
    settSamtykke: async () => ({ ok: true as const }),
  }));

  assert.ok(html.includes("Testresultater deles automatisk"), html);
  assert.ok(!html.includes("WANG-testresultater deles automatisk"), html);
  assert.ok(html.includes("Turneringsresultater og rundestatistikk"), html);
  assert.ok(!html.includes("Tester og resultater"), html);
  assert.equal((html.match(/role="switch"/g) ?? []).length, 2, html);
});

test("Team Norway-informasjonen vises når ingen ekstern lesergruppe ennå er aktiv", () => {
  const html = renderToStaticMarkup(createElement(TnSamtykkeSide, {
    automatiskWangTestdeling: true,
    organisasjoner: [],
    settSamtykke: async () => ({ ok: true as const }),
  }));

  assert.ok(html.includes("WANG-testresultater deles automatisk"), html);
  assert.ok(html.includes("Ingen frivillig deling er aktiv"), html);
});
