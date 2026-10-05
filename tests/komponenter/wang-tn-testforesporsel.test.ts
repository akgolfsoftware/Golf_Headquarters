/**
 * D-13 (05.10.2026): forespørselen «Del testene med Team Norway». Ingen
 * automatisk deling og ingen «kan ikke slås av»-tekst.
 */
import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
mock.module("server-only", { defaultExport: {} });
mock.module("@/components/team-norway/core", {
  namedExports: { TnLogo: () => createElement("span", null, "Team Norway") },
});

let WangTnTestforesporsel: typeof import("@/components/portal/precision/WangTnTestforesporsel").WangTnTestforesporsel;
let DelingSamtykkeKort: typeof import("@/components/portal/v2/DelingSamtykkeKort").DelingSamtykkeKort;
let TnSamtykkeSide: typeof import("@/components/portal/v2/TnSamtykkeSide").TnSamtykkeSide;
before(async () => {
  ({ WangTnTestforesporsel } = await import("@/components/portal/precision/WangTnTestforesporsel"));
  ({ DelingSamtykkeKort } = await import("@/components/portal/v2/DelingSamtykkeKort"));
  ({ TnSamtykkeSide } = await import("@/components/portal/v2/TnSamtykkeSide"));
});

test("ny forespørsel har teksten og de to knappene", () => {
  const html = renderToStaticMarkup(createElement(WangTnTestforesporsel, { status: "IKKE_SVART", kreverForesatt: false, modus: { type: "spiller" } }));
  assert.ok(html.includes("Del testene med Team Norway"), html);
  assert.ok(html.includes("Del med Team Norway"), html);
  assert.ok(html.includes("Ikke nå"), html);
  assert.ok(html.includes("ser ikke resten av profilen"), html);
});

test("under 16: eleven ser «Venter på forelder» etter ja", () => {
  const html = renderToStaticMarkup(createElement(WangTnTestforesporsel, { status: "VENTER_PA_FORELDER", kreverForesatt: true, modus: { type: "spiller" } }));
  assert.ok(html.includes("Venter på forelder"), html);
  assert.ok(html.includes("Trekk delingen"), html);
  assert.ok(!html.includes(">Del med Team Norway<"), html);
});

test("forelder kan godkjenne en ventende forespørsel", () => {
  const html = renderToStaticMarkup(createElement(WangTnTestforesporsel, { status: "VENTER_PA_FORELDER", kreverForesatt: true, modus: { type: "foresatt", childId: "barn", barnNavn: "Syntetisk Barn" } }));
  assert.ok(html.includes("Syntetisk har sagt ja"), html);
  assert.ok(html.includes("Del med Team Norway"), html);
});

test("delt: viser status og trekk-knapp", () => {
  const html = renderToStaticMarkup(createElement(WangTnTestforesporsel, { status: "DELT", kreverForesatt: false, modus: { type: "spiller" } }));
  assert.ok(html.includes("Deler nå"), html);
  assert.ok(html.includes("Trekk delingen"), html);
});

test("I dag viser bare kortet når eleven ikke har svart", () => {
  for (const status of ["DELT", "IKKE_DELT", "VENTER_PA_FORELDER"] as const) {
    assert.equal(renderToStaticMarkup(createElement(WangTnTestforesporsel, { status, kreverForesatt: false, modus: { type: "spiller" }, bareNyForesporsel: true })), "");
  }
});

test("delingsflatene sier aldri at testdeling er automatisk eller ikke kan slås av", () => {
  const kort = renderToStaticMarkup(createElement(DelingSamtykkeKort, {
    grupper: [{ gruppeId: "tn", gruppeNavn: "Team Norway", testResultater: false, stats: false }],
    modus: { type: "spiller" },
  }));
  const side = renderToStaticMarkup(createElement(TnSamtykkeSide, {
    organisasjoner: [{ gruppeId: "tn", navn: "Team Norway", testerOgResultater: false, komplettProfil: false }],
    settSamtykke: async () => ({ ok: true as const }),
  }));
  for (const html of [kort, side]) {
    assert.ok(!html.includes("kan ikke slås av"), html);
    assert.ok(!html.includes("deles automatisk"), html);
  }
});
