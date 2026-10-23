import test from "node:test";
import assert from "node:assert/strict";
import { beregnTestTrend } from "./test-trend";
import { scoreTest } from "@/lib/portal-tester/test-scoring";
const protokoll = (scoring: string) => ({ scoring, shots: [{ nr: 1 }], inputFields: [{ key: "verdi", unit: "sek" }] });
function maaling(n: number, scoring: string) {
  return { testId: "syntetisk-test", ...scoreTest(protokoll(scoring), [{ nr: 1, verdier: { verdi: n } }]) };
}
test("lavere tid er forbedring, flere poeng er forbedring", () => {
  for (const [kind, last, before] of [["time_seconds", 8, 10], ["points_total", 12, 10]] as const) {
    const r = beregnTestTrend(maaling(last, kind), Array.from({ length: 3 }, () => maaling(before, kind)), protokoll(kind));
    assert.equal(r?.relativ, 0.2);
  }
});
test("ukjent protokoll, manglende metodebevis og for få målinger gir ingen tiltak", () => {
  const m = maaling(10, "time_seconds");
  assert.equal(beregnTestTrend(m, [m, m], protokoll("time_seconds")), null);
  assert.equal(beregnTestTrend({ ...m, details: null }, [m, m, m], protokoll("time_seconds")), null);
  assert.equal(beregnTestTrend(m, [m, m, m], null), null);
});
test("null grunnlinje gir ikke oppdiktet prosent; endret score avvises", () => {
  const m = maaling(0, "time_seconds");
  assert.equal(beregnTestTrend(m, [m, m, m], protokoll("time_seconds"))?.relativ, null);
  assert.equal(beregnTestTrend({ ...m, score: 25 }, [m, m, m], protokoll("time_seconds")), null);
});
