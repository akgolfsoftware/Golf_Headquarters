import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DRILL_BANK_EMPTY_CODE,
  DRILL_BANK_EMPTY_MELDING_NO,
  erMasterbrainDrillBankTom,
  masterbrainDrillAntall,
  masterbrainDrillBankStatus,
} from "./drill-bank";

test("Masterbrain drill-bank er tom etter 2026-07-31-tømming", () => {
  assert.equal(masterbrainDrillAntall(), 0);
  assert.equal(erMasterbrainDrillBankTom(), true);
});

test("status bærer agent_regel og TOM-markør", () => {
  const s = masterbrainDrillBankStatus();
  assert.equal(s.tom, true);
  assert.equal(s.antall, 0);
  assert.match(s.status, /TOM/i);
  assert.match(s.agentRegel, /aldri|ikke|oppbygging/i);
});

test("empty-kode og norsk melding er stabile for agenter", () => {
  assert.equal(DRILL_BANK_EMPTY_CODE, "DRILL_BANK_EMPTY");
  assert.match(DRILL_BANK_EMPTY_MELDING_NO, /under oppbygging/);
  assert.match(DRILL_BANK_EMPTY_MELDING_NO, /ikke en oppdiktet/);
});
