import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parsePlayerScoresHtml } from "./golfstat-client";

// Trimmet utsnitt av ekte golfstat.com-respons (Bushnell Fall Invitational,
// tid=29253), fanget 2026-08-17. Kun de to første spillerradene beholdt.
const FIXTURE = readFileSync(
  join(__dirname, "__fixtures__/player-page-sample.html"),
  "utf8",
);

test("parsePlayerScoresHtml: henter navn, lag, brutto runder og total", () => {
  const rows = parsePlayerScoresHtml(FIXTURE);
  assert.equal(rows.length, 2);

  assert.deepEqual(rows[0], {
    golfstatPlayerId: 397313,
    playerName: "Quincy Beyrouty",
    team: "Oregon Tech",
    position: 1,
    roundScores: [70, 69],
    total: 139,
  });
  assert.deepEqual(rows[1], {
    golfstatPlayerId: 405339,
    playerName: "Jessica Ng",
    team: "British Columbia",
    position: 2,
    roundScores: [78, 70],
    total: 148,
  });
});

test("parsePlayerScoresHtml: total er summen av runde-scorene (sanity-sjekk mot ekte data)", () => {
  const rows = parsePlayerScoresHtml(FIXTURE);
  for (const r of rows) {
    const sum = r.roundScores.reduce((a, b) => a + b, 0);
    assert.equal(sum, r.total);
  }
});

test("parsePlayerScoresHtml: tom HTML gir tom liste", () => {
  assert.deepEqual(parsePlayerScoresHtml(""), []);
});
