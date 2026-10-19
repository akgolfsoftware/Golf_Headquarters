import { test } from "node:test";
import assert from "node:assert/strict";
import { PYR_REKKEFOLGE, PYR_TOPP_TIL_BUNN, sorterPyramideOvenfra } from "./pyramide";

test("pyramiden ovenfra og ned: TURN øverst, FYS alltid nederst", () => {
  assert.deepEqual(PYR_TOPP_TIL_BUNN, ["TURN", "SPILL", "SLAG", "TEK", "FYS"]);
  assert.equal(PYR_TOPP_TIL_BUNN.at(-1), "FYS");
});

test("grunnrekkefølgen er uendret (FYS først i lister og skjema)", () => {
  assert.deepEqual(PYR_REKKEFOLGE, ["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
});

test("sorterPyramideOvenfra legger FYS sist uansett rekkefølge inn, også med små bokstaver", () => {
  const inn = [{ a: "fys" }, { a: "TEK" }, { a: "slag" }, { a: "SPILL" }, { a: "turn" }];
  const ut = sorterPyramideOvenfra(inn, (l) => l.a).map((l) => l.a.toUpperCase());
  assert.deepEqual(ut, ["TURN", "SPILL", "SLAG", "TEK", "FYS"]);
});

test("sorterPyramideOvenfra endrer ikke lista den får, og ukjente akser havner til slutt", () => {
  const inn = ["FYS", "ANNET", "TURN"];
  const ut = sorterPyramideOvenfra(inn, (l) => l);
  assert.deepEqual(ut, ["TURN", "FYS", "ANNET"]);
  assert.deepEqual(inn, ["FYS", "ANNET", "TURN"]);
});
