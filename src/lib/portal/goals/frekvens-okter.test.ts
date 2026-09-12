import assert from "node:assert/strict";
import { test } from "node:test";
import { unikFullforteFrekvensOkter } from "./frekvens-okter";

test("tre modeller uten speil telles hver for seg", () => {
  assert.equal(
    unikFullforteFrekvensOkter([
      { id: "v2-1", modell: "v2", fullfort: true },
      { id: "wb-1", modell: "wb", fullfort: true },
      { id: "plan-1", modell: "plan", fullfort: true },
    ]),
    3,
  );
});

test("V2-speil av planøkt telles én gang", () => {
  assert.equal(
    unikFullforteFrekvensOkter([
      { id: "plan-1", modell: "plan", fullfort: true },
      { id: "v2-speil", modell: "v2", fullfort: true, speilAvPlanId: "plan-1" },
    ]),
    1,
  );
});

test("avbrutt økt telles ikke, lagret fullført gjør det", () => {
  assert.equal(
    unikFullforteFrekvensOkter([
      { id: "v2-avbrutt", modell: "v2", fullfort: false },
      { id: "wb-avbrutt", modell: "wb", fullfort: false },
      { id: "plan-fullfort", modell: "plan", fullfort: true },
    ]),
    1,
  );
});

test("samme rad to ganger telles én gang", () => {
  assert.equal(
    unikFullforteFrekvensOkter([
      { id: "wb-1", modell: "wb", fullfort: true },
      { id: "wb-1", modell: "wb", fullfort: true },
    ]),
    1,
  );
});
