import assert from "node:assert/strict";
import { test } from "node:test";
import { fordelingFraMal, fordelingSum, JEVN_FORDELING, maalSetning, startUker, tusenskille, validerMaal } from "./velg-plan";

test("malens fordeling brukes bare når den summerer til 100", () => {
  assert.deepEqual(fordelingFraMal({ FYS: 25, TEK: 25, SLAG: 30, SPILL: 15, TURN: 5 }), { fys: 25, tek: 25, slag: 30, spill: 15, turn: 5 });
  assert.deepEqual(fordelingFraMal({ FYS: 50 }), JEVN_FORDELING);
  assert.deepEqual(fordelingFraMal({ FYS: 30, TEK: 30, SLAG: 30, SPILL: 30, TURN: 30 }), JEVN_FORDELING);
  assert.equal(fordelingSum(JEVN_FORDELING), 100);
});

test("målet krever spesifikt mål, tall og dato", () => {
  assert.deepEqual(Object.keys(validerMaal({ s: "", m: "bedre", a: "", r: "", t: "" })), ["s", "m", "t"]);
  assert.deepEqual(validerMaal({ s: "Putting", m: "7 av 10", a: "", r: "", t: "2026-10-31" }), {});
});

test("målsetningen skrives med «—» når tall mangler, og er tom uten mål", () => {
  assert.equal(maalSetning({ s: "Bedre putting", m: "7 av 10 innenfor 4 m", a: "", r: "", t: "2026-10-31" }), "Innen 31.10.2026 skal jeg 7 av 10 innenfor 4 m — bedre putting.");
  assert.equal(maalSetning({ s: "Bedre putting", m: "", a: "", r: "", t: "" }), "Jeg skal — — bedre putting.");
  assert.equal(maalSetning({ s: "", m: "", a: "x", r: "", t: "" }), null);
});

test("startukene er tre påfølgende mandager fra neste mandag, i Oslo-tid", () => {
  const u = startUker(new Date("2026-09-30T10:00:00Z")); // onsdag uke 40
  assert.deepEqual(u.map((x) => x.mandag), ["2026-10-05", "2026-10-12", "2026-10-19"]);
  assert.deepEqual(u.map((x) => x.label), ["Uke 41", "Uke 42", "Uke 43"]);
  assert.equal(startUker(new Date("2026-10-04T21:30:00Z"))[0].mandag, "2026-10-05");
});

test("tusenskille bruker mellomrom", () => { assert.equal(tusenskille(1040), "1 040"); });
