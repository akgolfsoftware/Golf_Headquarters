import assert from "node:assert/strict";
import { test } from "node:test";
import { aggregerVolumPerUke, type TrainingLogInput } from "./volum";

const naa = new Date("2026-10-02T10:00:00Z");
function log(dato: string, minutes: number): TrainingLogInput {
  return { date: new Date(`${dato}T00:00:00Z`), sgArea: "APP", minutes };
}

test("registrerte minutter summeres; null erstattes aldri med planlagt varighet", () => {
  assert.deepEqual(aggregerVolumPerUke([log("2026-10-01", 45), log("2026-10-02", 0)], 4, naa),
    [{ uke: "2026-W40", sgArea: "APP", minutter: 45 }]);
});

test("framtidige og eldre logger er utenfor samme datovindu; første kalenderdag er med", () => {
  assert.deepEqual(aggregerVolumPerUke([
    log("2026-09-03", 999), log("2026-09-04", 30), log("2026-10-02", 45), log("2026-10-03", 999),
  ], 4, naa), [
    { uke: "2026-W36", sgArea: "APP", minutter: 30 },
    { uke: "2026-W40", sgArea: "APP", minutter: 45 },
  ]);
});

test("registrert 0 beholder en rad; ugyldige minutter lager ingen faktisk 0", () => {
  assert.deepEqual(aggregerVolumPerUke([log("2026-10-01", 0)], 4, naa),
    [{ uke: "2026-W40", sgArea: "APP", minutter: 0 }]);
  assert.deepEqual(aggregerVolumPerUke([log("2026-10-01", NaN), log("2026-10-01", -1)], 4, naa), []);
});

test("Oslo-dagen gjelder også når UTC fortsatt er forrige dato", () => {
  assert.deepEqual(aggregerVolumPerUke([log("2026-10-03", 45), log("2026-10-04", 999)], 4,
    new Date("2026-10-02T22:30:00Z")), [{ uke: "2026-W40", sgArea: "APP", minutter: 45 }]);
});

test("ISO-uken følger datokolonnen, også over årsskiftet", () => {
  assert.deepEqual(aggregerVolumPerUke([log("2025-12-29", 45), log("2026-01-01", 15)], 1,
    new Date("2026-01-02T10:00:00Z")), [{ uke: "2026-W01", sgArea: "APP", minutter: 60 }]);
});
