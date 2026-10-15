import { test } from "node:test";
import assert from "node:assert/strict";
import { formelLedd } from "./formel-ord";

test("AK-formelen skrives ut i ord, med flerordsledd samlet", () => {
  assert.deepEqual(formelLedd("SLAG_INNSPILL-50-100_LAV_HAST_TRENINGSOMRADE_ALENE"), ["SLAG", "Innspill 50 100", "Lav hastighet", "Treningsområde", "Alene"]);
  assert.deepEqual(formelLedd("TEK_UTEN_BALL_INNENDORS"), ["TEK", "Uten ball", "Innendørs"]);
  assert.deepEqual(formelLedd("SPILL_BANE_AUTO_BANE_TURNERING"), ["SPILL", "Bane", "Automatikk", "Bane", "Turnering"]);
});
