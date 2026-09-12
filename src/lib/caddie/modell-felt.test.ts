import assert from "node:assert/strict";
import { test } from "node:test";
import { erTillattCaddieModellStrengfelt } from "./modell-felt";

test("golfstatus kan sendes, ukjent fritekst kan ikke", () => {
  assert.equal(erTillattCaddieModellStrengfelt("pyramidArea"), true);
  assert.equal(erTillattCaddieModellStrengfelt("practiceType"), true);
  assert.equal(erTillattCaddieModellStrengfelt("comment"), false);
  assert.equal(erTillattCaddieModellStrengfelt("notes"), false);
  assert.equal(erTillattCaddieModellStrengfelt("previewText"), false);
});
