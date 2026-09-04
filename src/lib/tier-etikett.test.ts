import { test } from "node:test";
import assert from "node:assert/strict";
import { tierEtikett } from "./tier-etikett";

test("tierEtikett — GRATIS/PRO/ELITE mappes til produktnavn, aldri rått enum", () => {
  assert.equal(tierEtikett("GRATIS"), "TALENT");
  assert.equal(tierEtikett("PRO"), "FULL");
  assert.equal(tierEtikett("ELITE"), "FULL"); // dødt enum — vises likt PRO, aldri eget nivå
});
