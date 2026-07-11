import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { beregnTemplateVolum, type VolumSesjon, type Fordeling } from "@/lib/plan-templates/beregn-volum";

const JEVN_FORDELING: Fordeling = { FYS: 0.15, TEK: 0.27, SLAG: 0.3, SPILL: 0.2, TURN: 0.08 };

describe("beregnTemplateVolum", () => {
  it("tom mal: «—», ingen varsel, alt null/0", () => {
    const res = beregnTemplateVolum([], 4, JEVN_FORDELING);
    assert.equal(res.timerLabel, "—");
    assert.equal(res.snittMinPerUke, 0);
    assert.equal(res.storsteAvvik, null);
    assert.deepEqual(res.minPerUke, [0, 0, 0, 0]);
    assert.deepEqual(res.realisertProsent, { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 });
  });

  it("én uke, 4 økter à 75 min → 5,0 t/uke på uke-chip", () => {
    const sessions: VolumSesjon[] = [
      { ukeNr: 1, varighetMin: 75, pyramidArea: "FYS" },
      { ukeNr: 1, varighetMin: 75, pyramidArea: "TEK" },
      { ukeNr: 1, varighetMin: 75, pyramidArea: "SLAG" },
      { ukeNr: 1, varighetMin: 75, pyramidArea: "SPILL" },
    ];
    const res = beregnTemplateVolum(sessions, 1, JEVN_FORDELING);
    assert.equal(res.minPerUke[0], 300);
    assert.equal(res.snittMinPerUke, 300);
    assert.equal(res.timerLabel, "≈ 5,0 t/uke");
  });

  it("flere uker med hull: tomme uker teller i nevneren", () => {
    // 4-ukers mal, kun uke 1 og 3 har økter (300 min hver) — uke 2 og 4 tomme.
    const sessions: VolumSesjon[] = [
      { ukeNr: 1, varighetMin: 300, pyramidArea: "TEK" },
      { ukeNr: 3, varighetMin: 300, pyramidArea: "TEK" },
    ];
    const res = beregnTemplateVolum(sessions, 4, JEVN_FORDELING);
    assert.deepEqual(res.minPerUke, [300, 0, 300, 0]);
    // (300+300)/4 uker = 150 min/uke i snitt — IKKE (300+300)/2 fylte uker.
    assert.equal(res.snittMinPerUke, 150);
    assert.equal(res.timerLabel, "≈ 2,5 t/uke");
  });

  it("realisert % beregnes av totale minutter, ikke av glider-verdiene", () => {
    const sessions: VolumSesjon[] = [
      { ukeNr: 1, varighetMin: 100, pyramidArea: "SLAG" },
      { ukeNr: 1, varighetMin: 100, pyramidArea: "TEK" },
    ];
    const res = beregnTemplateVolum(sessions, 1, JEVN_FORDELING);
    assert.equal(res.realisertProsent.SLAG, 50);
    assert.equal(res.realisertProsent.TEK, 50);
    assert.equal(res.realisertProsent.FYS, 0);
  });

  it("største avvik: SLAG-glider 35% med 0 SLAG-minutter → stort avvik funnet", () => {
    const sessions: VolumSesjon[] = [
      { ukeNr: 1, varighetMin: 200, pyramidArea: "TEK" },
      { ukeNr: 1, varighetMin: 200, pyramidArea: "SPILL" },
    ];
    const skjevFordeling: Fordeling = { FYS: 0.1, TEK: 0.25, SLAG: 0.35, SPILL: 0.2, TURN: 0.1 };
    const res = beregnTemplateVolum(sessions, 1, skjevFordeling);
    assert.equal(res.storsteAvvik?.omrade, "SLAG");
    assert.equal(res.storsteAvvik?.diffPp, 35); // realisert 0% vs glider 35%
  });

  it("timerLabel bruker komma-desimal (norsk format)", () => {
    const sessions: VolumSesjon[] = [{ ukeNr: 1, varighetMin: 90, pyramidArea: "TEK" }];
    const res = beregnTemplateVolum(sessions, 1, JEVN_FORDELING);
    assert.equal(res.timerLabel, "≈ 1,5 t/uke");
    assert.doesNotMatch(res.timerLabel, /\./);
  });

  it("økter utenfor varighetUker teller ikke i minPerUke, men teller i total/fordeling", () => {
    const sessions: VolumSesjon[] = [
      { ukeNr: 1, varighetMin: 100, pyramidArea: "TEK" },
      { ukeNr: 9, varighetMin: 50, pyramidArea: "TEK" }, // utenfor 4-ukers mal
    ];
    const res = beregnTemplateVolum(sessions, 4, JEVN_FORDELING);
    assert.deepEqual(res.minPerUke, [100, 0, 0, 0]);
  });
});
