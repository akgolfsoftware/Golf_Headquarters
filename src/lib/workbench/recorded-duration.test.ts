import assert from "node:assert/strict";
import { test } from "node:test";
import { recordedCompletionMinutes } from "./recorded-duration";
test("begge eldre øktmodeller bruker lagret aktivitetstid, også faktisk null", () => {
  assert.equal(recordedCompletionMinutes({ totalSec: 360 }, "plan"), 6);
  assert.equal(recordedCompletionMinutes({ liveSummary: { durationSec: 360 } }, "v2"), 6);
  assert.equal(recordedCompletionMinutes({ totalSec: 0 }, "plan"), 0);
  assert.equal(recordedCompletionMinutes({ liveSummary: { durationSec: 0 } }, "v2"), 0);
});
test("ukjent, ugyldig og kalenderbasert tid blir aldri faktisk aktivitet", () => {
  for (const value of [null, {}, { durationMinutes: 50 }, { totalSec: -1 }, { totalSec: NaN }, { totalSec: "360" }, { totalSec: 604801 }]) assert.equal(recordedCompletionMinutes(value, "plan"), null);
  for (const durationSec of [null, -1, NaN, "360", 604801]) assert.equal(recordedCompletionMinutes({ liveSummary: { durationSec } }, "v2"), null);
});
