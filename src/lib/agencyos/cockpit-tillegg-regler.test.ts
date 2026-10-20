import { test } from "node:test";
import assert from "node:assert/strict";
import { velgUtenforPlan, UTENFOR_PLAN_TERSKEL, etterlevelsePerUke, stallensUke, stallRorledning, type Okt } from "./cockpit-tillegg-regler";

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

test("etterlevelse per uke: hele stallen samlet, null for uke uten forfalte økter", () => {
  const uker = [{ start: new Date(2026, 8, 14), uke: 38 }, { start: new Date(2026, 8, 21), uke: 39 }, { start: new Date(2026, 8, 28), uke: 40 }];
  const okter: Okt[] = [
    okt("A", 15, 60, "COMPLETED"), okt("B", 16, 60, "SKIPPED"), // uke 38: 50 %
    okt("A", 22, 90, "COMPLETED"), okt("B", 23, 10, "SKIPPED"), // uke 39: 90 %
    okt("A", 2, 60, "PLANNED"), // uke 40, men 2. oktober er etter «nå» → ingen forfalte
  ].map((o, i) => (i === 4 ? { ...o, scheduledAt: new Date(2026, 9, 2, 9) } : o));
  assert.deepEqual(etterlevelsePerUke(okter, uker, naa), [{ uke: 38, pct: 50 }, { uke: 39, pct: 90 }, { uke: 40, pct: null }]);
});

test("stallens uke teller ikke avlyste økter", () => {
  const okter: Okt[] = [okt("A", 28, 60, "COMPLETED"), okt("B", 29, 60, "PLANNED"), okt("C", 30, 60, "CANCELLED"), okt("D", 21, 60, "COMPLETED")];
  assert.deepEqual(stallensUke(okter, new Date(2026, 8, 28), 40), { uke: 40, gjennomfort: 1, planlagt: 2 });
});

test("rørledningen bruker samme status som Stall", () => {
  const r = stallRorledning([
    { status: "bak", statusLabel: "Bak plan" }, { status: "bak", statusLabel: "Bak plan" }, { status: "veil", statusLabel: "Ubesvart over 24 t" },
    { status: "aktiv", statusLabel: "Aktiv" }, { status: "aktiv", statusLabel: "Ingen plandata" },
    { status: "hviler", statusLabel: "Planlagt pause" },
  ]);
  assert.equal(r.total, 6);
  assert.deepEqual(r.trenger, { antall: 3, grunner: [{ label: "Bak plan", antall: 2 }, { label: "Ubesvart over 24 t", antall: 1 }] });
  assert.deepEqual(r.folger, { antall: 2, ingenPlan: 1 });
  assert.deepEqual(r.hviler, { antall: 1, grunner: [{ label: "Planlagt pause", antall: 1 }] });
});
