import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePlayerName } from "@/lib/scrapers/player-resolve";

/**
 * Eksakt-match-reglene for auto-link (uten DB):
 * - samme normalizePlayerName → kandidat
 * - >1 PublicPlayer med samme norm → hopp (tvetydig)
 */
test("normalizePlayerName: formateringsvarianter blir like", () => {
  assert.equal(
    normalizePlayerName("Øyvind Rohjan"),
    normalizePlayerName("oyvind rohjan"),
  );
  assert.equal(
    normalizePlayerName("Ola Nordmann (am)"),
    normalizePlayerName("Ola Nordmann"),
  );
});

test("normalizePlayerName: middelsnavn er ulike (skal IKKE auto-merges)", () => {
  assert.notEqual(
    normalizePlayerName("Herman Wibe Sekne"),
    normalizePlayerName("Herman Sekne"),
  );
});

test("link-kandidat-seleksjon: 0 / 1 / mange", () => {
  function pickCandidates(
    userName: string,
    players: string[],
  ): "none" | "one" | "ambiguous" {
    const k = normalizePlayerName(userName);
    const hits = players.filter((p) => normalizePlayerName(p) === k);
    if (hits.length === 0) return "none";
    if (hits.length === 1) return "one";
    return "ambiguous";
  }

  assert.equal(pickCandidates("Ola Nordmann", ["Kari Nordmann"]), "none");
  assert.equal(pickCandidates("Ola Nordmann", ["Ola Nordmann (am)"]), "one");
  assert.equal(
    pickCandidates("Ola Nordmann", ["Ola Nordmann", "Ola Nordmann (pro)"]),
    // normalize stripper (pro) → begge matcher → ambiguous
    "ambiguous",
  );
});
