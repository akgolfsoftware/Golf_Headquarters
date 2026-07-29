import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanName, firstLast } from "./dedupe-player-names";
import { normalizePlayerName } from "@/lib/scrapers/player-resolve";

test("cleanName fjerner parentes-markører", () => {
  assert.equal(cleanName("Ola Nordmann (am)"), "Ola Nordmann");
  assert.equal(cleanName("  Kari  (a)  Berg  "), "Kari Berg");
});

test("firstLast: første + siste token", () => {
  assert.equal(firstLast("Herman Wibe Sekne"), "herman|sekne");
  assert.equal(firstLast("Ola Nordmann"), "ola|nordmann");
});

test("formaterings-merge-nøkkel er normalizePlayerName", () => {
  // Samme nøkkel → trygg auto-merge-kandidat
  assert.equal(
    normalizePlayerName("Viktor Hovland (am)"),
    normalizePlayerName("Viktor Hovland"),
  );
  // Middelsnavn → ulik nøkkel → manuell review
  assert.notEqual(
    normalizePlayerName("Kristian K. Johansen"),
    normalizePlayerName("Kristian Johansen"),
  );
});
