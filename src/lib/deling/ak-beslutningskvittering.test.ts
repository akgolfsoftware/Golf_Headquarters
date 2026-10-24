import assert from "node:assert/strict";
import { test } from "node:test";
import { krevRegistrertAkBeslutning } from "./ak-beslutningskvittering";

test("only a matching recorded decision can produce an interactive success", () => {
  for (const valg of ["ACCEPTED", "REJECTED"] as const) {
    assert.doesNotThrow(() => krevRegistrertAkBeslutning({ status: valg }, valg));
    for (const status of ["UNCHANGED", "PROCESSING", "SUPERSEDED", "PENDING", "ACCEPTED", "REJECTED"]) {
      if (status !== valg) assert.throws(() => krevRegistrertAkBeslutning({ status }, valg), /allerede behandlet eller erstattet/);
    }
  }
});

test("question receipt distinguishes recorded question from a no-op without deciding the proposal", () => {
  assert.doesNotThrow(() => krevRegistrertAkBeslutning({ status: "UNCHANGED", questionRecorded: true }, "QUESTION"));
  for (const result of [{ status: "UNCHANGED" }, { status: "UNCHANGED", questionRecorded: false },
    { status: "ACCEPTED", questionRecorded: true }, { status: "REJECTED" }]) {
    assert.throws(() => krevRegistrertAkBeslutning(result, "QUESTION"), /allerede behandlet eller erstattet/);
  }
});
