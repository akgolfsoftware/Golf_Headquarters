import { test } from "node:test";
import assert from "node:assert/strict";
import { MIN_TEK_PROSENT, handhevTekMinimum } from "./invariants";
import { runPeriodizationSkill } from "./skills/periodization";

// CANON v3.5 invariant 1: TEK skal aldri kunne bli mindre enn 15 % av pyramiden.

test("handhevTekMinimum løfter TEK og bevarer summen", () => {
  const ut = handhevTekMinimum({ FYS: 40, TEK: 10, SLAG: 20, SPILL: 20, TURN: 10 });
  assert.equal(ut.TEK, MIN_TEK_PROSENT);
  const sum = Object.values(ut).reduce((a, b) => a + b, 0);
  assert.equal(sum, 100, "summen skal være uendret");
});

test("handhevTekMinimum rører ikke en pyramide som allerede oppfyller kravet", () => {
  const inn = { FYS: 20, TEK: 30, SLAG: 20, SPILL: 20, TURN: 10 };
  assert.deepEqual(handhevTekMinimum(inn), inn);
});

test("handhevTekMinimum tåler null", () => {
  assert.equal(handhevTekMinimum(null), null);
});

test("ingen periodiserings-gren kan gi TEK under 15 %", () => {
  const perioder = ["GRUNN", "SPES", "TURN", "HVILE", "OVERGANG"] as const;
  const dager = [null, 0, 3, 7, 14, 60];
  const ukeStart = new Date("2026-08-03T00:00:00.000Z");

  for (const periodType of perioder) {
    for (const skadeAktiv of [false, true]) {
      for (const dagerTilTurnering of dager) {
        for (const ukePosisjon of [0, 3, 11]) {
          const ut = runPeriodizationSkill({
            ukeStart,
            periodType,
            skadeAktiv,
            dagerTilTurnering,
            ukePosisjon,
            totaleUker: 12,
          });
          if (ut.pyramidOverride === null) continue;
          const tek = ut.pyramidOverride.TEK ?? 0;
          assert.ok(
            tek >= MIN_TEK_PROSENT,
            `${periodType}/skade=${skadeAktiv}/dager=${dagerTilTurnering} ga TEK ${tek}`,
          );
          const sum = Object.values(ut.pyramidOverride).reduce((a, b) => a + b, 0);
          assert.equal(sum, 100, `${periodType} ga sum ${sum}, ikke 100`);
        }
      }
    }
  }
});
