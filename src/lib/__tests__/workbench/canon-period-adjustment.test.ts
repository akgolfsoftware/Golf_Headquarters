import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CANON_PERIOD_ADJUSTMENT,
  canonDeviationChip,
} from "@/lib/workbench/canon-period-adjustment";

describe("CANON_PERIOD_ADJUSTMENT", () => {
  it("dekker alle 7 periodetyper med 5 PyramidArea-retninger hver", () => {
    // Regresjonsvakt (8c.1): 7 LPhase-nøkler; de 4 nye typene er "lik" over
    // hele linja til CANON sier noe annet.
    const faser = Object.keys(CANON_PERIOD_ADJUSTMENT);
    assert.equal(faser.length, 7);
    for (const fase of faser) {
      const retninger = CANON_PERIOD_ADJUSTMENT[fase as keyof typeof CANON_PERIOD_ADJUSTMENT];
      assert.equal(Object.keys(retninger).length, 5);
    }
    for (const nyFase of ["TESTUKE", "FERIE", "TRENINGSSAMLING", "HELDAGSSAMLING"] as const) {
      for (const retning of Object.values(CANON_PERIOD_ADJUSTMENT[nyFase])) {
        assert.equal(retning, "lik");
      }
    }
  });

  it("GRUNN foreslår FYS og TEK opp, SPILL og TURN ned", () => {
    assert.equal(CANON_PERIOD_ADJUSTMENT.GRUNN.FYS, "opp");
    assert.equal(CANON_PERIOD_ADJUSTMENT.GRUNN.TEK, "opp");
    assert.equal(CANON_PERIOD_ADJUSTMENT.GRUNN.SPILL, "ned");
    assert.equal(CANON_PERIOD_ADJUSTMENT.GRUNN.TURN, "ned");
  });

  it("TURNERING foreslår SPILL og TURN opp, TEK og FYS ned", () => {
    assert.equal(CANON_PERIOD_ADJUSTMENT.TURNERING.SPILL, "opp");
    assert.equal(CANON_PERIOD_ADJUSTMENT.TURNERING.TURN, "opp");
    assert.equal(CANON_PERIOD_ADJUSTMENT.TURNERING.TEK, "ned");
    assert.equal(CANON_PERIOD_ADJUSTMENT.TURNERING.FYS, "ned");
  });
});

describe("canonDeviationChip", () => {
  it("returnerer null når fordelingen stemmer med CANON", () => {
    const chip = canonDeviationChip({ FYS: 30, TEK: 30, SPILL: 10, TURN: 5 }, "GRUNN");
    assert.equal(chip, null);
  });

  it("flagger avvik når FYS er lavere enn CANON anbefaler i GRUNN-periode", () => {
    const chip = canonDeviationChip({ FYS: 10, TEK: 30 }, "GRUNN");
    assert.ok(chip?.includes("FYS"));
  });

  it("gir aldri avvik for områder uten CANON-retning ('lik')", () => {
    // SLAG er "lik" i GRUNN — uansett faktisk prosent skal det ikke gi avvik.
    const chip = canonDeviationChip({ SLAG: 2 }, "GRUNN");
    assert.equal(chip, null);
  });

  it("returnerer null når ingen av de relevante områdene har data", () => {
    assert.equal(canonDeviationChip({}, "TURNERING"), null);
  });
});
