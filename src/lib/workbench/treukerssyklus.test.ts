import assert from "node:assert/strict";
import { test } from "node:test";
import { syklusUker, SyklusMandagSchema, KopierSyklusSchema, syklusPlanfelter } from "./treukerssyklus";
import { isoUkeIdentitet, tommeUkeplandetaljer, UkeSyklusMetadataSchema } from "./ukeplan-schema";
import { anonymiserUkeplandetaljer } from "./ukeplan-personvern";
test("årsskifte/uke53 og sommertid bruker faktiske kalenderuker", () => {
  assert.deepEqual(syklusUker("2032-12-20"), ["2032-12-20", "2032-12-27", "2033-01-03"]);
  assert.deepEqual(syklusUker("2032-12-20").map(isoUkeIdentitet), [{ isoYear: 2032, weekNumber: 52 }, { isoYear: 2032, weekNumber: 53 }, { isoYear: 2033, weekNumber: 1 }]);
  assert.deepEqual(syklusUker("2027-03-22"), ["2027-03-22", "2027-03-29", "2027-04-05"]);
  for (const date of ["2027-01-05", "2027-02-30"]) assert.equal(SyklusMandagSchema.safeParse(date).success, false);
});
test("kopi tillater ikke overlapp; cyclemetadata valideres/vaskes, planfelter bevarer null0", () => {
  const operation = "00000000-0000-4000-8000-000000000001";
  const cycle = { version: 1 as const, id: operation, anchorWeek: "2032-12-20", position: 0, operationId: operation, fingerprint: "a".repeat(64) };
  assert.ok(UkeSyklusMetadataSchema.safeParse(cycle).success);
  assert.equal(UkeSyklusMetadataSchema.safeParse({ ...cycle, position: 3 }).success, false);
  const details = { ...tommeUkeplandetaljer(), cycle };
  assert.equal(anonymiserUkeplandetaljer(details)?.cycle, undefined);
  const fields = syklusPlanfelter({ playerId: "syntetisk", isoYear: 2032, weekNumber: 52, weekType: "TURNERING", notes: ["TEST"], plannedHoursFys: 0, plannedHoursTek: null, planningDetails: details });
  assert.equal(fields.plannedHoursFys, 0); assert.equal(fields.plannedHoursTek, null); assert.equal(fields.planningDetails?.cycle, undefined);
  assert.equal(KopierSyklusSchema.safeParse({ playerId: "syntetisk", anchorWeek: "2032-12-20", targetWeek: "2032-12-27", requestId: operation, sourceExpected: Array(3).fill("a".repeat(64)), targetExpected: Array(3).fill("b".repeat(64)), confirmedFilledTargets: true }).success, false);
});
