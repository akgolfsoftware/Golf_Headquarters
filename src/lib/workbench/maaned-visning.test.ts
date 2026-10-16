import assert from "node:assert/strict";
import { test } from "node:test";
import { byggMaanedUker, fraTimerMin, minutterFraUkeplan, tilTimerMin, ukerSomLagres } from "./maaned-visning";

test("timer og minutter regnes om begge veier", () => {
  assert.equal(tilTimerMin(225), "3:45");
  assert.equal(tilTimerMin(0), "0:00");
  assert.equal(fraTimerMin("3:45"), 225);
  assert.equal(fraTimerMin("3.45"), 225);
  assert.equal(fraTimerMin("2"), 120);
  assert.equal(fraTimerMin("45 min"), 45);
  assert.equal(fraTimerMin(""), 0);
  assert.equal(fraTimerMin("3:75"), null);
  assert.equal(fraTimerMin("mye"), null);
});

test("ukeplanens timer blir minutter, og tom ukeplan er ikke fordelt", () => {
  const rad = { isoYear: 2026, weekNumber: 42, plannedHoursFys: 1.5, plannedHoursTek: 0.75, plannedHoursSlag: null, plannedHoursSpill: null, plannedHoursTurn: 0 };
  assert.deepEqual(minutterFraUkeplan(rad), { FYS: 90, TEK: 45, TURN: 0 });
  assert.equal(minutterFraUkeplan({ ...rad, plannedHoursFys: null, plannedHoursTek: null, plannedHoursTurn: null }), null);
  assert.equal(minutterFraUkeplan(undefined), null);
});

test("ukene i oktober 2026 får fordelt, lagt inn og gjennomført", () => {
  const uker = byggMaanedUker({
    year: 2026, month: 10,
    okter: [
      { date: "2026-10-12", durationMinutes: 60, pyramid: "SLAG", status: "COMPLETED" },
      { date: "2026-10-14", durationMinutes: 45, pyramid: "TEK", status: "PLANNED" },
      { date: "2026-10-15", durationMinutes: 90, pyramid: "TEK", status: "CANCELLED" },
      { date: "2026-09-30", durationMinutes: 30, pyramid: "FYS", status: "COMPLETED" },
    ],
    ukeplaner: [{ isoYear: 2026, weekNumber: 42, plannedHoursFys: 1, plannedHoursTek: 2, plannedHoursSlag: 2, plannedHoursSpill: 1, plannedHoursTurn: null }],
    overstyringer: { "2026-U43": { TEK: 120 } },
  });
  assert.deepEqual(uker.map((u) => u.weekNumber), [40, 41, 42, 43, 44]);
  const u42 = uker.find((u) => u.weekNumber === 42)!;
  assert.deepEqual(u42.fordelt, { FYS: 60, TEK: 120, SLAG: 120, SPILL: 60 });
  assert.equal(u42.lagtInn.SLAG, 60);
  assert.equal(u42.lagtInn.TEK, 45);
  assert.equal(u42.gjennomfort, 60);
  // Uke 40 starter mandag 28. sep., så økta 30. sep. hører til oktober.
  assert.equal(uker[0].gjennomfort, 30);
  assert.equal(uker.find((u) => u.weekNumber === 43)!.endret, true);
  assert.equal(u42.endret, false);
});

test("bare endrede og allerede tilpassede uker lagres, og gåtte uker sendes aldri", () => {
  const uker = [
    { nokkel: "2026-U41", fordelt: { FYS: 60 }, endret: true },
    { nokkel: "2026-U42", fordelt: { FYS: 60, TEK: 60 }, endret: false },
    { nokkel: "2026-U43", fordelt: { FYS: 60 }, endret: false },
    { nokkel: "2026-U44", fordelt: { FYS: 60 }, endret: true },
  ];
  const v = (fys: number, tek = 0) => ({ FYS: fys, TEK: tek, SLAG: 0, SPILL: 0, TURN: 0 });
  const ut = ukerSomLagres({
    uker,
    verdier: { "2026-U41": v(30), "2026-U42": v(60, 60), "2026-U43": v(90), "2026-U44": v(60) },
    apne: new Set(["2026-U42", "2026-U43", "2026-U44"]),
    folgPerioden: new Set(["2026-U44"]),
  });
  assert.deepEqual(Object.keys(ut), ["2026-U43"]);
  assert.equal(ut["2026-U43"]?.FYS, 90);
});
