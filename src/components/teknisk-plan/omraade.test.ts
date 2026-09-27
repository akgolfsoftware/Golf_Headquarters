import { test } from "node:test";
import assert from "node:assert/strict";
import { OMRAADE_FANER, omraadeTilKode, omraadeToTab, omraadeVisning } from "./constants";

test("putting vises i fot med meter i parentes", () => {
  assert.equal(omraadeVisning("PUTT_10_25"), "Putt 10–25 fot (3–7,6 m)");
  assert.equal(omraadeVisning("PUTT_40_PLUSS"), "Putt 40+ fot (12,2 m +)");
  assert.equal(omraadeVisning("INNSPILL_150"), "Innspill 150–200 m");
});

test("gamle fritekst-områder mappes til typet kode; 10-15 og 15-25 slås sammen", () => {
  assert.equal(omraadeTilKode("Putt 10-15"), "PUTT_10_25");
  assert.equal(omraadeTilKode("Putt 15-25"), "PUTT_10_25");
  assert.equal(omraadeTilKode("App 150-200"), "INNSPILL_150");
  assert.equal(omraadeTilKode("TEE_TOTAL"), "TEE_TOTAL");
  assert.equal(omraadeTilKode(omraadeVisning("PUTT_3_5")), "PUTT_3_5");
  assert.equal(omraadeTilKode("tull"), null);
});

test("fanene dekker fasitens golfområder og peker riktig", () => {
  assert.deepEqual(Object.keys(OMRAADE_FANER), ["Utslag", "Innspill", "Nærspill", "Putting"]);
  assert.equal(OMRAADE_FANER.Putting.length, 6);
  assert.equal(omraadeToTab("CHIP"), "Nærspill");
  assert.equal(omraadeToTab("STYRKE"), "Utslag");
});
