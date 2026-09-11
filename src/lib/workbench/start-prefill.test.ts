import assert from "node:assert/strict";
import { test } from "node:test";
import { parseWorkbenchStart } from "./start-prefill";

test("ny økt beholder norsk dag fra både norsk og UTC-generert ukestart", () => {
  for (const start of ["2026-08-16T22:00:00Z", "2026-08-17T00:00:00Z"]) {
    assert.deepEqual(parseWorkbenchStart("2026-08-17T09:00", start), { dayIndex: 0, tid: "09:00" });
    assert.deepEqual(parseWorkbenchStart("2026-08-23T23:59", start), { dayIndex: 6, tid: "23:30" });
    assert.equal(parseWorkbenchStart("2026-08-24T09:00", start), null);
  }
  assert.deepEqual(parseWorkbenchStart("2026-03-29T09:00", "2026-03-22T23:00:00Z"), { dayIndex: 6, tid: "09:00" });
});

test("ugyldig dato eller klokke avvises uten å normalisere til en annen dag", () => {
  for (const raw of ["2026-02-30T09:00", "2026-02-23T24:00", "2026-02-23T08:60", "2026-02-23T09:00feil", "", null]) {
    assert.equal(parseWorkbenchStart(raw, "2026-02-23T00:00:00Z"), null);
  }
  assert.equal(parseWorkbenchStart("2026-02-23T09:00", "ugyldig"), null);
});
