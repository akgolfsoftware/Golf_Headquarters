import assert from "node:assert/strict";
import { test } from "node:test";

import { medEvent, referanseEventIder, utenEvent } from "./referanse-regler";

test("lagret rad leses som unike positive heltall", () => {
  assert.deepEqual(referanseEventIder([12345, 12400, 12345, "7", -1, 0, 1.5, null]), [12345, 12400]);
  assert.deepEqual(referanseEventIder(null), []);
  assert.deepEqual(referanseEventIder({ a: 1 }), []);
});

test("legg til dobler aldri en turnering, og fjern tar bare den ene", () => {
  assert.deepEqual(medEvent([1, 2], 2), [1, 2]);
  assert.deepEqual(medEvent([1, 2], 3), [1, 2, 3]);
  assert.deepEqual(utenEvent([1, 2, 3], 2), [1, 3]);
  assert.deepEqual(utenEvent([1], 9), [1]);
});
