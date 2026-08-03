// Ren enhetstest for restraint-prompt-blokken (ingen mocks).
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRestraintBlock } from "@/lib/coach-restraint/prompt";

const MED_DATA = {
  bands: [
    { metric: "carry" as const, center: 151.234, halfWidth: 6.55, sampleSize: 24 },
    { metric: "side" as const, center: -1.1, halfWidth: 4, sampleSize: 24 },
  ],
  klubb: "7-jern",
  ballerLogget: 35,
  sisteTrackManOkt: { dato: "2026-07-20", antallSlag: 48 },
};

test("blokken inneholder tale-disiplinens kjerneregler", () => {
  const blokk = buildRestraintBlock(MED_DATA);
  assert.ok(blokk.includes("Stillhet er standard"));
  assert.ok(blokk.includes("Aldri tall etter enkeltslag"));
  assert.ok(blokk.includes("Selvestimat FØR data"));
  assert.ok(blokk.includes("pushes aldri"));
  assert.ok(blokk.includes("Eksternt fokus"));
  assert.ok(blokk.includes("stille testblokk"));
});

test("bånd og kontekst rendres avrundet og med kølle", () => {
  const blokk = buildRestraintBlock(MED_DATA);
  assert.ok(blokk.includes("(7-jern)"));
  assert.ok(blokk.includes("carry: normalt 151.2 ± 6.6 (24 slag)"));
  assert.ok(blokk.includes("Baller logget i denne økta: 35."));
  assert.ok(blokk.includes("Siste TrackMan-økt: 2026-07-20 (48 slag, mest 7-jern)"));
});

test("uten data: ærlig om manglende grunnlag, ingen tall-linjer", () => {
  const blokk = buildRestraintBlock({
    bands: [],
    klubb: null,
    ballerLogget: null,
    sisteTrackManOkt: null,
  });
  assert.ok(blokk.includes("For lite slagdata"));
  assert.ok(blokk.includes("ingen slagdata i det hele tatt"));
  assert.equal(blokk.includes("Baller logget"), false);
});
