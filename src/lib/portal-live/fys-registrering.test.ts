import assert from "node:assert/strict";
import { test } from "node:test";
import { fysLoggState, fysVisningsrader, golfLoggTall, lesFysRegistrering, type FysRegistrering } from "./fys-registrering";

const registreringer: FysRegistrering[] = [
  { type: "styrke", sett: [{ vekt: 2.5, reps: 2 }, { vekt: 0, reps: 3 }], notat: "Siste tekst — med tillegg" },
  { type: "kondisjon", minutter: 11, sone: "S4", notat: "Siste bokstav." },
  { type: "hold", sekunder: 25, notat: "Oppdatert holdnotat" },
  { type: "reps", repetisjoner: 3, notat: "Oppdatert repsnotat" },
];
for (const reg of registreringer) test(`${reg.type}: lagring og lesing bevarer enheter og siste notat`, () => {
  assert.deepEqual(lesFysRegistrering(fysLoggState(reg).logNotes), reg);
  assert.equal(lesFysRegistrering(fysLoggState({ ...reg, notat: "" }).logNotes)?.notat, "");
});
test("fysiske enheter vises uten golfslag eller treff", () => {
  assert.deepEqual(fysVisningsrader(registreringer[1]), [{ label: "Registrert varighet", verdi: "11 min" }, { label: "Pulssone", verdi: "S4" }]);
  assert.deepEqual(fysVisningsrader(registreringer[2]), [{ label: "Hold", verdi: "25 sek" }]);
});
test("ukjent og ugyldig eldre tekst blir ikke gjettede målinger", () => {
  for (const raw of [null, "", "Notat uten struktur", "Kondisjon: 999 min i sone 8", "Styrke: 20 kg × NaN", "Bevegelighet: hold -5 sek", "Bevegelighet: 201 reps"]) assert.equal(lesFysRegistrering(raw), null);
});
test("en registrert null er forskjellig fra ingen registrering", () => {
  assert.deepEqual(lesFysRegistrering("Kondisjon: 0 min i sone 1"), { type: "kondisjon", minutter: 0, sone: "S1", notat: "" });
});
test("blandede økter summerer bare golfregistreringene som reps/treff", () => {
  const drills = [{ id: "golf", pyramide: "TEK" as const, plannedReps: 20 }, { id: "fys", pyramide: "FYS" as const, plannedReps: 60 }];
  const logs = [{ drillId: "golf", repsTotal: 12, repsHit: 7 }, { drillId: "fys", repsTotal: 25, repsHit: 25 }, { drillId: "ukjent", repsTotal: 99, repsHit: 99 }];
  assert.deepEqual(golfLoggTall(drills, logs), { planReps: 20, totalReps: 12, treff: 7 });
  assert.deepEqual(golfLoggTall(drills.slice(1), logs), { planReps: 0, totalReps: 0, treff: 0 });
});
