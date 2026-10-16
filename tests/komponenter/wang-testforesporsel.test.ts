/**
 * D-55 (07.10.2026): testsamtykket for WANG-elever. Ett ja deler testene med
 * WANG-skolen og Team Norway. Ingen automatisk deling uten samtykke og ingen
 * «kan ikke slås av»-tekst (D-69).
 */
import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
mock.module("server-only", { defaultExport: {} });
mock.module("@/components/team-norway/core", {
  namedExports: { TnLogo: () => createElement("span", null, "Team Norway") },
});

let WangTestforesporsel: typeof import("@/components/portal/precision/WangTestforesporsel").WangTestforesporsel;
const GRUPPE = { gruppeId: "wang-a", gruppeNavn: "WANG Skole A" };
let DelingSamtykkeKort: typeof import("@/components/portal/v2/DelingSamtykkeKort").DelingSamtykkeKort;
let TnSamtykkeSide: typeof import("@/components/portal/v2/TnSamtykkeSide").TnSamtykkeSide;
before(async () => {
  ({ WangTestforesporsel } = await import("@/components/portal/precision/WangTestforesporsel"));
  ({ DelingSamtykkeKort } = await import("@/components/portal/v2/DelingSamtykkeKort"));
  ({ TnSamtykkeSide } = await import("@/components/portal/v2/TnSamtykkeSide"));
});

test("ny forespørsel har teksten og de to knappene", () => {
  const html = renderToStaticMarkup(createElement(WangTestforesporsel, { ...GRUPPE, status: "IKKE_SVART", kreverForesatt: false, modus: { type: "spiller" } }));
  assert.ok(html.includes("Del testresultatene med WANG og Team Norway"), html);
  assert.ok(html.includes("WANG Skole A og Team Norway"), html);
  assert.ok(html.includes(">Del testresultatene<"), html);
  assert.ok(html.includes("Ikke nå"), html);
  assert.ok(html.includes("ser ikke"), html);
  assert.ok(html.includes("skjules også eldre"), html);
});

test("under 16: eleven ser «Venter på forelder» etter ja", () => {
  const html = renderToStaticMarkup(createElement(WangTestforesporsel, { ...GRUPPE, status: "VENTER_PA_FORELDER", kreverForesatt: true, modus: { type: "spiller" } }));
  assert.ok(html.includes("Venter på forelder"), html);
  assert.ok(html.includes("Trekk delingen"), html);
  assert.ok(!html.includes(">Del testresultatene<"), html);
});

test("forelder kan godkjenne en ventende forespørsel", () => {
  const html = renderToStaticMarkup(createElement(WangTestforesporsel, { ...GRUPPE, status: "VENTER_PA_FORELDER", kreverForesatt: true, modus: { type: "foresatt", childId: "barn", barnNavn: "Syntetisk Barn" } }));
  assert.ok(html.includes("Syntetisk har sagt ja"), html);
  assert.ok(html.includes(">Del testresultatene<"), html);
});

test("delt: viser status og trekk-knapp", () => {
  const html = renderToStaticMarkup(createElement(WangTestforesporsel, { ...GRUPPE, status: "DELT", kreverForesatt: false, modus: { type: "spiller" } }));
  assert.ok(html.includes("Deler nå"), html);
  assert.ok(html.includes("Trekk delingen"), html);
});

test("nei eller trukket: «Samtykke mangler» og mulighet til å dele igjen", () => {
  const html = renderToStaticMarkup(createElement(WangTestforesporsel, { ...GRUPPE, status: "IKKE_DELT", kreverForesatt: false, modus: { type: "spiller" } }));
  assert.ok(html.includes("Samtykke mangler"), html);
  assert.ok(html.includes(">Del testresultatene<"), html);
  assert.ok(!html.includes("Trekk delingen"), html);
});

test("I dag viser bare kortet når eleven ikke har svart", () => {
  for (const status of ["DELT", "IKKE_DELT", "VENTER_PA_FORELDER"] as const) {
    assert.equal(renderToStaticMarkup(createElement(WangTestforesporsel, { ...GRUPPE, status, kreverForesatt: false, modus: { type: "spiller" }, bareNyForesporsel: true })), "");
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
