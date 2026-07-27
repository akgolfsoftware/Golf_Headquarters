/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/domain/maal-fremdrift.test.ts
 *
 * Modulet ble trimmet 27. juli 2026 (sammenslåing av to grener) til kun
 * SG-mål-hjelperne — orkestreringen (`beregnMaalFremdrift`) er erstattet av
 * `beregnGoalProgress` (src/lib/portal/goals/progress.ts), som har egne
 * tester for SG_AREA-formelen.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { lesSgMaal, erSgOmrade, SG_OMRADE_NAVN } from "./maal-fremdrift";

test("lesSgMaal tåler søppel i payload uten å kaste", () => {
  assert.equal(lesSgMaal(null), null);
  assert.equal(lesSgMaal("PUTT"), null);
  assert.equal(lesSgMaal([{ sgOmrade: "PUTT" }]), null);
  assert.equal(lesSgMaal({ sgOmrade: "TULL" }), null);
  assert.equal(lesSgMaal({ abandonReason: "gikk videre" }), null);
  assert.deepEqual(lesSgMaal({ sgOmrade: "ARG" }), { omrade: "ARG", start: null });
  assert.deepEqual(lesSgMaal({ sgOmrade: "ARG", sgStart: "-0.4" }), { omrade: "ARG", start: null });
  assert.deepEqual(lesSgMaal({ sgOmrade: "ARG", sgStart: -0.4 }), { omrade: "ARG", start: -0.4 });
});

test("erSgOmrade skiller ekte områder fra søppel", () => {
  assert.equal(erSgOmrade("OTT"), true);
  assert.equal(erSgOmrade("PUTT"), true);
  assert.equal(erSgOmrade("TULL"), false);
  assert.equal(erSgOmrade(123), false);
  assert.equal(erSgOmrade(null), false);
});

test("SG-områdenavnene følger AK-fasiten", () => {
  assert.equal(SG_OMRADE_NAVN.OTT, "Tee Total");
  assert.equal(SG_OMRADE_NAVN.APP, "Innspill");
  assert.equal(SG_OMRADE_NAVN.ARG, "Nærspill");
  assert.equal(SG_OMRADE_NAVN.PUTT, "Putting");
});
