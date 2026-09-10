import { test } from "node:test";
import assert from "node:assert/strict";
import { withTnAssignments, tnComparableResult } from "./tn-integration";
import { tnProtocol } from "./tn-catalog";
import { tnScore } from "./tn-scoring";
import { beregnTestNivaaer } from "@/lib/domain/talent-sync";

test("coach får versjonerte tester før første registrering, men ingen uavklart protokoll", () => {
  const rows = withTnAssignments([{ id: "private", name: "Putt 1–3 m", isCustom: true, description: null, pyramidArea: "SLAG" }]);
  assert.equal(rows[0].id, "private");
  assert.ok(rows.some(x => x.id === "tn-v3-putt-1-3m"));
  assert.ok(!rows.some(x => x.id === "tn-v3-wedge-gate"));
  assert.equal(new Set(rows.map(x => x.id)).size, rows.length);
});
test("resultatets identitet og lagrede score må stemme før sammenligning", () => {
  const p = tnProtocol("putt-1-3m")!;
  const result = tnScore(p, Object.fromEntries(p.rows.map((_,i)=>[String(i+1),{strokes:1}])));
  assert.ok(tnComparableResult("tn-v3-putt-1-3m",25,result));
  assert.equal(tnComparableResult("tn-v3-wedge-variation",25,result),null);
  assert.equal(tnComparableResult("tn-v3-putt-1-3m",26,result),null);
});
test("lavere PEI er forbedring, og ulikt antall/protokoll kan ikke bli samme trend", () => {
  const older={testId:"tn-v3-pei-test-bane",testNavn:"PEI Test Bane",pyramidArea:"SLAG",score:0.2,takenAt:new Date("2026-09-01"),benchmarks:null,comparisonKey:"v:18:PEI",direction:"lower" as const,unit:"PEI"};
  const newer={...older,score:0.1,takenAt:new Date("2026-09-02")};
  const result=beregnTestNivaaer([older,newer]).SLAG;
  assert.equal(result.trend,"opp");assert.equal(result.unit,"PEI");assert.equal(result.benchmarkNivaa,null);
  assert.equal(beregnTestNivaaer([older,{...newer,comparisonKey:"v:9:PEI"}]).SLAG.trend,null);
});
