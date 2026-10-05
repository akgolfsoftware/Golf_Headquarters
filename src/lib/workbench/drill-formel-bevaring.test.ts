import assert from "node:assert/strict";
import { test } from "node:test";
import type { AKFormel } from "@/lib/domain/workbench/types";
import { bevarHistoriskeDrillfelt, FORMEL_FELT, gyldigFormelEndring } from "./drill-formel-bevaring";

test("uendret liste bevarer ukjente historiske postfelt; endring og tømming er autoritativ", () => {
  const gammel = { detaljer: { utstyr: [{ navn: "Syntetisk matte", antall: 0, historisk: { x: 1 } }], kondisjonssegmenter: [{ minutter: 5, pulssone: "S2", kilde: "Syntetisk" }], eldre: true }, gammel: true };
  const ny = { detaljer: { utstyr: [{ navn: "Syntetisk matte", antall: 0 }], kondisjonssegmenter: [{ minutter: 5, pulssone: "S2" }] } };
  assert.deepEqual(JSON.parse(JSON.stringify(bevarHistoriskeDrillfelt(gammel, ny, FORMEL_FELT).detaljer)), gammel.detaljer);
  assert.deepEqual(JSON.parse(JSON.stringify(bevarHistoriskeDrillfelt(gammel, { detaljer: { utstyr: [{ navn: "Syntetisk annen" }] } }, FORMEL_FELT).detaljer)), { eldre: true, utstyr: [{ navn: "Syntetisk annen" }] });
  assert.deepEqual(JSON.parse(JSON.stringify(bevarHistoriskeDrillfelt(gammel, { detaljer: {} }, FORMEL_FELT).detaljer)), { eldre: true });
});

test("historisk RIR kan beholdes, men ikke endres til en ny ugyldig verdi", () => {
  const base: AKFormel = { pyramid: "FYS", area: "STYRKE", label: "Syntetisk", detaljer: { mengde: { enhet: "SERIER", reps: 6, rir: 7 } } };
  const gammel = { pyramid: "FYS", area: "STYRKE", label: "Syntetisk", detaljer: { mengde: { enhet: "SERIER", reps: 6, rir: 7 } } };
  assert.equal(gyldigFormelEndring(gammel, base), true);
  for (const rir of [-1, 5, 8, 4.4, NaN]) assert.equal(gyldigFormelEndring(gammel, { ...base, detaljer: { mengde: { enhet: "SERIER", rir } } }), false);
  for (const rir of [0, 4]) assert.equal(gyldigFormelEndring(gammel, { ...base, detaljer: { mengde: { enhet: "SERIER", rir } } }), true);
  assert.equal(gyldigFormelEndring(null, base), false);
});
