import assert from "node:assert/strict";
import { test } from "node:test";
import { sgAkse, skjulLaastPlanData, valgtGodkjenningsforslag } from "./ph01-visning";
import { IDAG_UI } from "./idag-visning";

test("positiv og negativ SG bruker samme skala og lengde", () => {
  const neg = sgAkse(-0.8)!; const pos = sgAkse(0.8)!;
  assert.equal(neg.grense, pos.grense); assert.equal(neg.bredde, pos.bredde);
  assert.equal(neg.start + neg.bredde, 50); assert.equal(pos.start, 50);
  assert.deepEqual(sgAkse(3), { grense: 3, start: 50, bredde: 50 });
});
test("SG null/ugyldig er manglende, målt null er gyldig", () => {
  assert.equal(sgAkse(null), null); assert.equal(sgAkse(NaN), null); assert.equal(sgAkse(Infinity), null);
  assert.deepEqual(sgAkse(0), { grense: 2, start: 50, bredde: 0 });
});
test("et nytt forslag deaktiverer ikke en annen aktiv økt", () => {
  const pending = [{ id: "coach-forslag" }];
  assert.equal(valgtGodkjenningsforslag(pending, "aktiv-okt", true), null);
  assert.equal(valgtGodkjenningsforslag(pending, undefined, false)?.id, "coach-forslag");
  assert.equal(valgtGodkjenningsforslag(pending, "coach-forslag", true)?.id, "coach-forslag");
  assert.equal(valgtGodkjenningsforslag([], undefined, false), null);
});
test("nettverksfeil lover ikke at økten er lagret", () => {
  assert.doesNotMatch(IDAG_UI.feilBrød, /ligger lagret|trygt|sikkert lagret/i);
});

test("låst plan serialiserer ikke øktinnhold til klienten", () => {
  const data = {
    naa: { id: "hemmelig-okt", tittel: "Privat økt" },
    neste: { id: "neste-okt", tittel: "Neste private økt" },
    hendelser: [
      { id: "plan-1", lag: "OEKTER", tittel: "Planøkt" },
      { id: "booking-1", lag: "BOOKING", tittel: "Fitting" },
    ],
    godkjenninger: [{ id: "forslag-1", tittel: "Trenerforslag" }],
    fangstOkt: { id: "fangst-1", notat: "Internt øktnotat" },
    valgtOktId: "hemmelig-okt",
    okterUke: 4,
    fullfortUke: 2,
    prikker: [{ tom: false, idag: false, fylt: true }],
    weekProgress: {
      plannedMin: 240,
      completedMin: 90,
      plannedByAxis: { FYS: 60, TEK: 60, SLAG: 60, SPILL: 60, TURN: 0 },
      completedByAxis: { FYS: 30, TEK: 30, SLAG: 30, SPILL: 0, TURN: 0 },
    },
  };

  assert.equal(skjulLaastPlanData(false, data), data);

  const synlig = skjulLaastPlanData(true, data);
  assert.equal(synlig.naa, null);
  assert.equal(synlig.neste, null);
  assert.deepEqual(synlig.hendelser, [data.hendelser[1]]);
  assert.deepEqual(synlig.godkjenninger, []);
  assert.equal(synlig.fangstOkt, null);
  assert.equal(synlig.valgtOktId, undefined);
  assert.equal(synlig.okterUke, 0);
  assert.equal(synlig.fullfortUke, 0);
  assert.deepEqual(synlig.prikker, [{ tom: false, idag: false, fylt: false }]);
  assert.equal(synlig.weekProgress.plannedMin, 0);
  assert.equal(synlig.weekProgress.completedMin, 0);
  assert.deepEqual(synlig.weekProgress.plannedByAxis, { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 });
  assert.deepEqual(synlig.weekProgress.completedByAxis, { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 });
});
