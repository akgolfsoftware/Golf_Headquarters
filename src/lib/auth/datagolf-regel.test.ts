/**
 * Data Golf-regelen (Anders 09.10.2026): bare ADMIN ser Data Golf-tall (19.10.2026).
 * Coach, spiller, forelder, gjest og uinnlogget får alltid nei.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DATAGOLF_ROLLER,
  UTEN_DATAGOLF_TURNERING,
  erDataGolfTurnering,
  kanSeDataGolf,
} from "./datagolf-regel";

test("ADMIN ser Data Golf", () => {
  assert.equal(kanSeDataGolf({ role: "ADMIN" }), true);
});

test("COACH, PLAYER, PARENT og GUEST ser aldri Data Golf", () => {
  assert.equal(kanSeDataGolf({ role: "COACH" }), false);
  assert.equal(kanSeDataGolf({ role: "PLAYER" }), false);
  assert.equal(kanSeDataGolf({ role: "PARENT" }), false);
  assert.equal(kanSeDataGolf({ role: "GUEST" }), false);
});

test("uinnlogget ser aldri Data Golf", () => {
  assert.equal(kanSeDataGolf(null), false);
  assert.equal(kanSeDataGolf(undefined), false);
});

test("rollelista er nøyaktig ADMIN — ingen utvidelse uten beslutning", () => {
  assert.deepEqual([...DATAGOLF_ROLLER], ["ADMIN"]);
});

test("turneringsfilteret tar bort DATAGOLF, men beholder turneringer uten kilde", () => {
  assert.deepEqual(UTEN_DATAGOLF_TURNERING, {
    OR: [{ sourceOrigin: null }, { sourceOrigin: { not: "DATAGOLF" } }],
  });
  assert.equal(erDataGolfTurnering({ sourceOrigin: "DATAGOLF" }), true);
  assert.equal(erDataGolfTurnering({ sourceOrigin: "GOLFBOX" }), false);
  assert.equal(erDataGolfTurnering({ sourceOrigin: null }), false);
});
