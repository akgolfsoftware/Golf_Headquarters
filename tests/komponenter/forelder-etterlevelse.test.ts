import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ForelderUkerapportV2 } from "@/components/portal/v2/ForelderUkerapportV2";
import type { ForelderUkerapport } from "@/lib/forelder";

const fixture: ForelderUkerapport = {
  childFirstName: "Test", childName: "Testspiller", childAge: null, consentActive: true,
  ukenummer: 40, oktFullfort: 1, oktPlanlagt: 3, etterlevelseTekst: "25 %",
  nevnerTekst: "gjennomførte mot planlagte minutter · siste fire uker", utestaendeOre: 0,
  fokusOmrade: null, sgRetning: null, oppmotePct: 33, sgTrendDelta: null, streak: 0,
  trend8uker: [], coachNote: null, trentTimer: 0.5, ukeSg: null, hoydepunkt: null,
};
function render(data: ForelderUkerapport | null) {
  return renderToStaticMarkup(createElement(ForelderUkerapportV2, { data, okter: [], ukeSpenn: "28.09.–04.10.2026" }));
}

test("foresatt ser minuttprosenten og perioden mens eget oppmøtetall bevares", () => {
  const html = render(fixture);
  assert.ok(html.includes(">25 %<"));
  assert.ok(html.includes("Etterlevelse · siste fire uker"));
  assert.ok(html.includes(fixture.nevnerTekst));
  assert.ok(html.includes("Oppmøte"));
  assert.ok(html.includes("av 3"));
});

test("uten forfalte minutter vises strek fremfor falsk nullprosent", () => {
  const html = render({ ...fixture, etterlevelseTekst: null });
  assert.ok(html.includes(">—<"));
  assert.ok(!html.includes(">0 %<"));
});

test("uten godkjent barn gjengis ingen etterlevelse eller spilleridentitet", () => {
  const html = render(null);
  assert.ok(html.includes("Ingen barn er koblet ennå"));
  assert.ok(!html.includes("Testspiller"));
  assert.ok(!html.includes("Etterlevelse · siste fire uker"));
});
