import test from "node:test";
import assert from "node:assert/strict";
import { sgSnapshot, sgSammenligningsnokkel, sammenlignbareSgRunder } from "./analyse-grunnlag";
const sg = { sgTotal: 1, sgOtt: 0.3, sgApp: 0.2, sgArg: 0.1, sgPutt: 0.4 };
const runde = () => ({ ...sg, playStatus: "COMPLETED", partialSave: false, sgSource: "beregnet", dataQuality: "slag_for_slag_komplett",
  sgReferenceSetId: "ref", benchmarkLevelSnapshot: "scratch", sgEngineVersion: "v1", roundType: "turnering",
  holeScores: Array.from({ length: 18 }, (_, i) => ({ holeNumber: i + 1, strokes: 4 })) });
test("fem runder kreves per SG-område, ikke bare totalt", () => {
  assert.equal(sgSnapshot([sg]).sgTotal, null);
  const res = sgSnapshot([sg, sg, sg, sg, { ...sg, sgPutt: null }]);
  assert.equal(res.sgTotal, 1);
  assert.equal(res.sgPutt, null);
  assert.equal(res.antallPerOmrade.sgPutt, 4);
});
test("ingen blanding av referanse, versjon, type eller ufullstendige hull", () => {
  const a = runde();
  for (const bad of [{ ...a, sgEngineVersion: null }, { ...a, partialSave: true },
    { ...a, holeScores: a.holeScores.slice(0, 9) }, { ...a, sgSource: "manual" }]) assert.equal(sgSammenligningsnokkel(bad), null);
  const compared = sammenlignbareSgRunder([a], [a, { ...a, benchmarkLevelSnapshot: "tour" },
    { ...a, sgEngineVersion: "v2" }, { ...a, roundType: "trening" }]);
  assert.equal(compared.post.length, 1);
});
test("ingen gyldig førmåling gir ingen ettertolkning", () => {
  assert.equal(sammenlignbareSgRunder([], [runde()]).post.length, 0);
  assert.equal(sgSnapshot([{ ...sg, sgTotal: NaN }]).sgTotal, null);
});
