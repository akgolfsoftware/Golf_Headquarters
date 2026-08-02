import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateSessionConstraints, type Periode } from "./periode-constraints";

// Datoene er de virkelige fra prod 2026-07-29: testuka ligger inne i GRUNN.
const PERIODER: Periode[] = [
  { type: "GRUNN", startDato: new Date("2026-10-01"), sluttDato: new Date("2027-03-15") },
  { type: "EVALUERING", startDato: new Date("2026-10-19"), sluttDato: new Date("2026-10-25") },
];

// Fordeling som er LOVLIG i EVALUERING og ULOVLIG i GRUNN — da er det
// periodevalget alene som avgjør utfallet, ikke tilfeldige andre brudd.
//   EVALUERING: FYS ≤15, TEK ≤15, SLAG 5–25, SPILL 20–45, TURN 30–65  → OK
//   GRUNN:      FYS 25–40, TEK 25–40, SLAG 5–20, SPILL 5–20, TURN 0–5 → 4 brudd
function okt(id: string, dato: string) {
  return {
    id, startTime: new Date(dato),
    drills: [
      { pyramide: "FYS", durationMinutes: 10 },
      { pyramide: "TEK", durationMinutes: 10 },
      { pyramide: "SLAG", durationMinutes: 15 },
      { pyramide: "SPILL", durationMinutes: 25 },
      { pyramide: "TURN", durationMinutes: 40 },
    ],
  } as never;
}

describe("overlappende perioder", () => {
  test("økt i testuka måles mot testuka, ikke grunnperioden", () => {
    // 21. okt ligger i BEGGE periodene. Smaleste (testuka) skal vinne.
    const r = validateSessionConstraints([okt("a", "2026-10-21")], PERIODER);
    const brudd = r.bruddBeskrivelser.flatMap((b) => b.brudd);
    assert.deepEqual(brudd, [], `skulle være lovlig i testuka, fikk: ${brudd.join(" · ")}`);
  });

  test("samme økt utenfor testuka måles mot grunnperioden", () => {
    const r = validateSessionConstraints([okt("b", "2026-11-10")], PERIODER);
    const brudd = r.bruddBeskrivelser.flatMap((b) => b.brudd);
    assert.ok(brudd.length > 0, "identisk økt skal bryte GRUNN utenfor testuka");
  });

  test("rekkefølgen på perioder endrer ikke utfallet", () => {
    const a = validateSessionConstraints([okt("c", "2026-10-21")], PERIODER);
    const b = validateSessionConstraints([okt("c", "2026-10-21")], [...PERIODER].reverse());
    assert.deepEqual(a.bruddBeskrivelser, b.bruddBeskrivelser);
  });
});
