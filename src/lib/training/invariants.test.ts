import { test } from "node:test";
import assert from "node:assert/strict";
import { ANBEFALT_MIN_TEK_PROSENT, tekAnbefalingsVarsel } from "./invariants";
import { runPeriodizationSkill } from "./skills/periodization";

// CANON v3.5 invariant 1: TEK bør være minst 15 %. Det er en ANBEFALING —
// fordelingen er ikke låst, og koden skal aldri skrive den om i stillhet.

test("tekAnbefalingsVarsel sier fra når TEK er under anbefalingen", () => {
  const varsel = tekAnbefalingsVarsel({ FYS: 40, TEK: 10, SLAG: 20, SPILL: 20, TURN: 10 });
  assert.ok(varsel, "det skal komme et varsel");
  assert.match(varsel, /10 %/);
  assert.match(varsel, new RegExp(`${ANBEFALT_MIN_TEK_PROSENT} %`));
});

test("tekAnbefalingsVarsel er stille når anbefalingen er oppfylt", () => {
  assert.equal(
    tekAnbefalingsVarsel({ FYS: 20, TEK: 30, SLAG: 20, SPILL: 20, TURN: 10 }),
    null,
  );
  assert.equal(tekAnbefalingsVarsel({ TEK: ANBEFALT_MIN_TEK_PROSENT }), null);
});

test("tekAnbefalingsVarsel tåler null", () => {
  assert.equal(tekAnbefalingsVarsel(null), null);
});

test("periodiseringen endrer aldri fordelingen — den varsler bare", () => {
  const perioder = ["GRUNN", "SPES", "TURN", "HVILE", "OVERGANG"] as const;
  const dager = [null, 0, 3, 7, 14, 60];
  const ukeStart = new Date("2026-08-03T00:00:00.000Z");
  let settLavTek = 0;

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

          const sum = Object.values(ut.pyramidOverride).reduce((a, b) => a + b, 0);
          assert.equal(sum, 100, `${periodType} ga sum ${sum}, ikke 100`);

          const tek = ut.pyramidOverride.TEK ?? 0;
          const harVarsel = ut.begrensninger.some((b) => b.includes("Teknikk ligger på"));
          if (tek < ANBEFALT_MIN_TEK_PROSENT) {
            settLavTek++;
            assert.ok(
              harVarsel,
              `${periodType}/skade=${skadeAktiv} har TEK ${tek} uten varsel`,
            );
          } else {
            assert.ok(!harVarsel, `${periodType} varslet unødig på TEK ${tek}`);
          }
        }
      }
    }
  }

  assert.ok(settLavTek > 0, "testen skal faktisk ha truffet minst én lav-TEK-gren");
});
