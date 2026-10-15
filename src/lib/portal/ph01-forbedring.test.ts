import { test } from "node:test";
import assert from "node:assert/strict";
import { forbedringsomraader, type SgRunde } from "./ph01-forbedring";

const r = (app: number | null, arg: number | null, ott: number | null = 0.2, putt: number | null = 0.1): SgRunde => ({ sgOtt: ott, sgApp: app, sgArg: arg, sgPutt: putt });

test("under fire runder gir ingen konklusjon", () => {
  assert.deepEqual(forbedringsomraader([r(-1, -1), r(-1, -1), r(-1, -1)]), []);
});

test("viser de mest negative kategoriene først, og bare negative", () => {
  const runder = Array.from({ length: 6 }, () => r(-0.9, -0.4));
  const ut = forbedringsomraader(runder);
  assert.deepEqual(ut.map((o) => [o.kode, o.verdi]), [["APP", -0.9], ["ARG", -0.4]]);
});

test("foreløpig til 12 runder for innspill og 24 for nærspill", () => {
  const ut = forbedringsomraader(Array.from({ length: 12 }, () => r(-1, -1)));
  assert.equal(ut.find((o) => o.kode === "APP")!.forelopigTil, null);
  assert.equal(ut.find((o) => o.kode === "ARG")!.forelopigTil, 24);
});

test("trenden går fra eldst til nyest", () => {
  const ut = forbedringsomraader([r(-0.5, null), r(-1, null), r(-1.5, null), r(-2, null)]);
  assert.deepEqual(ut[0].trend, [-2, -1.5, -1, -0.5]);
});
