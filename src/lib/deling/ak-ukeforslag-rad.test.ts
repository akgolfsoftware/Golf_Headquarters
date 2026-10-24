import assert from "node:assert/strict";
import { test } from "node:test";
import { akUkeradSchema, akUkeradTekst, forklaringMedAkUkerad } from "./ak-ukeforslag-rad";
import { akUkeutkastSchema } from "./ak-ukeforslag-format";

test("advice displays fixed text without IDs, preserves session index zero and deduplicates per session", () => {
  const advice = akUkeradSchema.parse([
    { kode: "FASILITET_IKKE_BEKREFTET", oktIndeks: 0, exerciseId: "private-id-one" },
    { kode: "FASILITET_IKKE_BEKREFTET", oktIndeks: 0, exerciseId: "private-id-two" },
    { kode: "FASILITET_IKKE_BEKREFTET", oktIndeks: 1, exerciseId: "private-id-two" },
  ]);
  const text = akUkeradTekst(advice);
  assert.equal(text.length, 2);
  assert.match(text[0], /^Økt 1: /); assert.match(text[1], /^Økt 2: /);
  assert.doesNotMatch(text.join(" "), /private-id/);
  assert.equal(forklaringMedAkUkerad("Grunnlag", undefined), "Grunnlag");
  assert.match(forklaringMedAkUkerad("Grunnlag", advice), /^Grunnlag\n\nFaglige råd – veiledende:/);
});

test("advice rejects arbitrary text, unknown codes and out-of-bound session indices", () => {
  for (const row of [{ kode: "UNKNOWN" }, { kode: "PERIODE_MANGLER", text: "instructions" },
    { kode: "PERIODE_MANGLER", oktIndeks: -1 }, { kode: "PERIODE_MANGLER", oktIndeks: 21 }]) {
    assert.equal(akUkeradSchema.safeParse([row]).success, false);
  }
});

test("planner cannot supply its own trusted advice", () => {
  const draft = { tittel: "Syntetisk", forklaring: "Syntetisk",
    sessions: [{ title: "Putting", pyramidArea: "TEK", scheduledAt: "2026-10-27T16:00:00Z",
      durationMin: 30, drills: [{ exerciseId: "drill", exerciseRevisjon: "1", minutter: 30 }] }] };
  assert.equal(akUkeutkastSchema.safeParse(draft).success, true);
  assert.equal(akUkeutkastSchema.safeParse({ ...draft, fagligeRad: [] }).success, false);
});


test("advice capacity covers all allowed sessions and exercises while rejecting unbounded payloads", () => {
  const max = 21 * 12 * 4 + 7;
  const advice = Array.from({ length: max }, () => ({ kode: "FAGLIG_VURDERING_GJENSTAR", oktIndeks: 20, exerciseId: "synthetic" }));
  assert.equal(akUkeradSchema.safeParse(advice).success, true);
  assert.equal(akUkeradSchema.safeParse([...advice, advice[0]]).success, false);
});
