import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fordeltPerAkse, gruppeTelling, lagtInnPerAkse, timer } from "./workbench-budsjett";
import type { WeekViewModel, WorkbenchSession } from "@/lib/domain/workbench/types";

const okt = (pyramid: WorkbenchSession["pyramid"], durationMinutes: number, ekstra: Partial<WorkbenchSession> = {}) =>
  ({ id: `${pyramid}-${durationMinutes}-${Math.random()}`, pyramid, durationMinutes, status: "PUBLISHED", ...ekstra }) as WorkbenchSession;

describe("workbench-budsjett (Ukeverksted, designløftet 20.10)", () => {
  it("fordelt kommer fra ukeplanens timer per akse, i minutter", () => {
    const uke = { weekPlan: { plannedHoursFys: 2, plannedHoursTek: 2.5, plannedHoursSlag: 3, plannedHoursSpill: 1.5, plannedHoursTurn: 0.5 } } as unknown as WeekViewModel;
    assert.deepEqual(fordeltPerAkse(uke), { FYS: 120, TEK: 150, SLAG: 180, SPILL: 90, TURN: 30 });
  });
  it("uten ukeplan eller uten timer er ingenting fordelt (null, vises som «—»)", () => {
    assert.equal(fordeltPerAkse({ weekPlan: null } as unknown as WeekViewModel), null);
    assert.equal(fordeltPerAkse({ weekPlan: { plannedHoursFys: 0 } } as unknown as WeekViewModel), null);
  });
  it("lagt inn summerer minutter per akse, og avlyste økter teller ikke", () => {
    const m = lagtInnPerAkse([okt("TEK", 60), okt("TEK", 45), okt("SLAG", 90), okt("FYS", 30, { status: "CANCELLED" })]);
    assert.deepEqual(m, { FYS: 0, TEK: 105, SLAG: 90, SPILL: 0, TURN: 0 });
  });
  it("gruppeøkter telles, og en endret gruppeøkt er «Egen»", () => {
    const g = gruppeTelling([okt("SLAG", 90, { sourceGroupSessionId: "g1" }), okt("SLAG", 90, { sourceGroupSessionId: "g2", localOverride: true }), okt("TEK", 60)]);
    assert.deepEqual(g, { fraGruppa: 2, egen: 1 });
  });
  it("timer skrives med norsk komma", () => {
    assert.equal(timer(90), "1,5");
    assert.equal(timer(0), "0,0");
  });
});
