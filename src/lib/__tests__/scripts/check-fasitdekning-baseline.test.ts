import test from "node:test";
import assert from "node:assert/strict";
import { vurderDekning, parseBaseline } from "../../../../scripts/check-fasitdekning-baseline.mjs";

test("feiler når HEAD siterer færre enn baselinen", () => {
  const r = vurderDekning({ sitert: 148, totalt: 210 }, { sitert: 150, av: 210 });
  assert.equal(r.ok, false);
  assert.match(r.melding, /148\/210/);
  assert.match(r.melding, /150\/210/);
});

test("likt eller flere er OK, og forslag om å heve baselinen ved flere", () => {
  assert.equal(vurderDekning({ sitert: 150, totalt: 210 }, { sitert: 150, av: 210 }).ok, true);
  const flere = vurderDekning({ sitert: 151, totalt: 211 }, { sitert: 150, av: 210 });
  assert.equal(flere.ok, true);
  assert.match(flere.melding, /baseline kan heves til 151/);
});

test("parseBaseline: ugyldig JSON gir strukturert feil, ikke unntak", () => {
  const r = parseBaseline("{ dette er ikke gyldig json");
  assert.equal(r.ok, false);
  assert.match(r.feil, /ikke gyldig JSON/);
});

test("parseBaseline: manglende tallfelt gir strukturert feil", () => {
  const r = parseBaseline(JSON.stringify({ av: 210 }));
  assert.equal(r.ok, false);
  assert.match(r.feil, /mangler tallfeltene/);
});

test("parseBaseline: gyldig JSON gir baseline-objekt", () => {
  const r = parseBaseline(JSON.stringify({ sitert: 150, av: 210 }));
  assert.equal(r.ok, true);
  assert.deepEqual(r.baseline, { sitert: 150, av: 210 });
});
