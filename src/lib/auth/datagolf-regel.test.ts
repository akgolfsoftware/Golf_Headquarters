/**
 * Data Golf-regelen (Anders 09.10.2026): bare COACH og ADMIN ser Data Golf-tall.
 * Spiller, forelder, gjest og uinnlogget får alltid nei.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DATAGOLF_ROLLER,
  UTEN_DATAGOLF_TURNERING,
  erDataGolfTurnering,
  kanSeDataGolf,
} from "./datagolf-regel";

test("COACH og ADMIN ser Data Golf", () => {
  assert.equal(kanSeDataGolf({ role: "COACH" }), true);
  assert.equal(kanSeDataGolf({ role: "ADMIN" }), true);
});

test("PLAYER, PARENT og GUEST ser aldri Data Golf", () => {
  assert.equal(kanSeDataGolf({ role: "PLAYER" }), false);
  assert.equal(kanSeDataGolf({ role: "PARENT" }), false);
  assert.equal(kanSeDataGolf({ role: "GUEST" }), false);
});

test("uinnlogget ser aldri Data Golf", () => {
  assert.equal(kanSeDataGolf(null), false);
  assert.equal(kanSeDataGolf(undefined), false);
});

test("rollelista er nøyaktig COACH og ADMIN — ingen utvidelse uten beslutning", () => {
  assert.deepEqual([...DATAGOLF_ROLLER].sort(), ["ADMIN", "COACH"]);
});

test("turneringsfilteret tar bort DATAGOLF, men beholder turneringer uten kilde", () => {
  assert.deepEqual(UTEN_DATAGOLF_TURNERING, {
    OR: [{ sourceOrigin: null }, { sourceOrigin: { not: "DATAGOLF" } }],
  });
  assert.equal(erDataGolfTurnering({ sourceOrigin: "DATAGOLF" }), true);
  assert.equal(erDataGolfTurnering({ sourceOrigin: "GOLFBOX" }), false);
  assert.equal(erDataGolfTurnering({ sourceOrigin: null }), false);
});
