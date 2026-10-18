import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FysPrecisionLogger } from "@/components/portal/live/FysPrecisionLogger";
import type { DrillItem } from "@/lib/portal-live/ph04-07-data";
import type { FysRegistrering } from "@/lib/portal-live/fys-registrering";

const drill: DrillItem = { id: "synthetic-fys", code: "DR-01", name: "Syntetisk fysisk øvelse", club: "", quantity: 0, unit: "reps", minutes: 10, axis: "fys",
  fys: { type: "styrke", sett: 3, reps: 8, vektKg: 80 } };
function render(value: FysRegistrering | null, over: Partial<DrillItem> = {}) {
  let changes = 0;
  const html = renderToStaticMarkup(createElement(FysPrecisionLogger, { drill: { ...drill, ...over }, value, onChange: () => { changes++; } }));
  assert.equal(changes, 0); return html;
}
test("planlagt vekt/reps vises som plan, med tom faktisk måling og ingen automatisk lagring", () => {
  const html = render(null);
  assert.match(html, /Planlagt: 3 sett · 8 reps · 80 kg/);
  assert.match(html, /Ingen fysisk måling registrert ennå/);
  assert.match(html, /Registrer målingen/);
  assert.doesNotMatch(html, /value="80"|value="8"/);
  assert.match(html, /value=""/);
  assert.match(html, /htmlFor=|for="[^"]+-weight-0"/);
});
test("lagret styrke, kondisjon, hold og reps vises i riktig enhet etter gjenåpning", () => {
  const strength = render({ type: "styrke", sett: [{ vekt: 2.5, reps: 3 }], notat: "" });
  assert.match(strength, /value="2.5"/); assert.match(strength, /value="3"/);
  const cardio = render({ type: "kondisjon", minutter: 11, sone: "S4", notat: "" });
  assert.match(cardio, /Gjennomført varighet \(minutter\)/); assert.match(cardio, /value="11"/);
  assert.match(cardio.match(/<input[^>]+value="S4"[^>]*>/)?.[0] ?? "", /checked/);
  assert.match(render({ type: "hold", sekunder: 25, notat: "" }), /value="25"/);
  assert.match(render({ type: "reps", repetisjoner: 3, notat: "" }), /value="3"/);
});
test("ukjent kondisjonsmåling har verken antatt S3 eller absolutte pulsgrenser", () => {
  const html = render(null, { fys: { type: "kondisjon", minutter: 20, pulssone: "S4" } });
  assert.doesNotMatch(html, /checked|120–140|140–160|175/);
  assert.match(html, /Planlagt: 20 min · S4/);
  assert.match(html, /Oppnådd pulssone/);
});
