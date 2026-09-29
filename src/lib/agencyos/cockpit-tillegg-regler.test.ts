import { test } from "node:test";
import assert from "node:assert/strict";
import { velgUtenforPlan, UTENFOR_PLAN_TERSKEL, type Okt } from "./cockpit-tillegg-regler";

// Forrige uke starter mandag 21.09; uka før starter 14.09. «Nå» er onsdag 30.09.
const forrigeUke = new Date(2026, 8, 21);
const naa = new Date(2026, 8, 30, 12);

function okt(userId: string, dag: number, min: number, status: Okt["status"]): Okt {
  return { userId, navn: `Spiller ${userId}`, scheduledAt: new Date(2026, 8, dag, 9), durationMin: min, status };
}

test("med bare når begge ukene er under terskelen", () => {
  const okter: Okt[] = [
    // A: 50 % og 60 % → med
    okt("A", 15, 60, "COMPLETED"), okt("A", 16, 60, "PLANNED"),
    okt("A", 22, 60, "COMPLETED"), okt("A", 23, 40, "SKIPPED"),
    // B: 50 % og 100 % → ikke med
    okt("B", 15, 60, "COMPLETED"), okt("B", 16, 60, "SKIPPED"),
    okt("B", 22, 60, "COMPLETED"),
    // C: bare én uke med plan → ikke med (ingen prosent uten nevner)
    okt("C", 22, 60, "SKIPPED"),
  ];
  const rader = velgUtenforPlan(okter, forrigeUke, naa);
  assert.deepEqual(rader.map((r) => r.id), ["A"]);
  assert.equal(rader[0].forrige, 50);
  assert.equal(rader[0].siste, 60);
  assert.equal(rader[0].href, "/admin/spillere/A/plan");
});

test("nøyaktig på terskelen teller som å følge planen", () => {
  const okter: Okt[] = [
    okt("D", 15, 70, "COMPLETED"), okt("D", 16, 30, "SKIPPED"),
    okt("D", 22, 10, "COMPLETED"), okt("D", 23, 90, "SKIPPED"),
  ];
  assert.equal(UTENFOR_PLAN_TERSKEL, 70);
  assert.deepEqual(velgUtenforPlan(okter, forrigeUke, naa), []);
});

test("økter utenfor de to ukene teller ikke, og laveste siste uke kommer først", () => {
  const okter: Okt[] = [
    okt("E", 8, 60, "COMPLETED"), // uka før vinduet
    okt("E", 15, 100, "SKIPPED"), okt("E", 22, 100, "SKIPPED"),
    okt("F", 15, 100, "SKIPPED"), okt("F", 22, 50, "COMPLETED"), okt("F", 23, 50, "SKIPPED"),
    okt("F", 29, 60, "COMPLETED"), // denne uka
  ];
  const rader = velgUtenforPlan(okter, forrigeUke, naa);
  assert.deepEqual(rader.map((r) => [r.id, r.forrige, r.siste]), [["E", 0, 0], ["F", 0, 50]]);
});
