import assert from "node:assert/strict";
import { test } from "node:test";

import { nyRekkefolge } from "@/lib/domain/workbench/ovelse-rekkefolge";

test("flytter en øvelse ett steg opp eller ned uten å endre originalen", () => {
  const ider = ["a", "b", "c"];
  assert.deepEqual(nyRekkefolge(ider, 1, -1), ["b", "a", "c"]);
  assert.deepEqual(nyRekkefolge(ider, 1, 1), ["a", "c", "b"]);
  assert.deepEqual(ider, ["a", "b", "c"]);
});

test("gir null ved kantene og ved ugyldig indeks", () => {
  assert.equal(nyRekkefolge(["a", "b"], 0, -1), null);
  assert.equal(nyRekkefolge(["a", "b"], 1, 1), null);
  assert.equal(nyRekkefolge(["a"], 0, 1), null);
  assert.equal(nyRekkefolge(["a", "b"], -1, 1), null);
  assert.equal(nyRekkefolge(["a", "b"], 5, -1), null);
  assert.equal(nyRekkefolge([], 0, 1), null);
});
