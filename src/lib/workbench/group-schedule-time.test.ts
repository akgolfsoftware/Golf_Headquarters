import { test } from "node:test";
import assert from "node:assert/strict";
import { gruppeSkjemaTid, gruppeDupliseringTid, gruppeNesteUke } from "./group-schedule-time";
test("gruppetid er norsk lokaltid både vinter og sommer", () => {
  assert.equal(gruppeSkjemaTid("2026-01-19","08:00").toISOString(),"2026-01-19T07:00:00.000Z");
  assert.equal(gruppeSkjemaTid("2026-06-19","08:00").toISOString(),"2026-06-19T06:00:00.000Z");
  assert.equal(gruppeDupliseringTid("2026-10-26T08:00").toISOString(),"2026-10-26T07:00:00.000Z");
});
test("duplisering beholder samme lokale klokkeslett over sommertid", () => {
  assert.equal(gruppeNesteUke("2026-10-19T06:00:00Z"),"2026-10-26T08:00");
  assert.equal(gruppeNesteUke("2026-03-23T07:00:00Z"),"2026-03-30T08:00");
});
test("avviser ugyldig dato, klokkeslett og tvetydig eller manglende norsk tid", () => {
  for (const [dato,tid] of [["2026-02-30","08:00"],["2026-10-01","24:00"],["2026-03-29","02:30"],["2026-10-25","02:30"]]) assert.throws(()=>gruppeSkjemaTid(dato,tid));
  assert.throws(()=>gruppeDupliseringTid("2026-10-01T08:00Z"));
});
