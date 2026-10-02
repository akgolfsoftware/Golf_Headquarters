import { test } from "node:test";
import assert from "node:assert/strict";
import { byggTurneringslag, type TurneringsPlanInn } from "./kalender-turnering";

const UKE = ["2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"];

const plan: TurneringsPlanInn = {
  id: "p1",
  tittel: "Testturnering",
  spiller: "Ola Testesen",
  spillerId: "s1",
  startDato: "2026-10-02",
  sluttDato: "2026-10-03",
  reiseFra: "2026-10-01",
  reiseTil: "2026-10-01",
};

test("turneringsdager og reisedag havner på riktig dag", () => {
  const lag = byggTurneringslag(UKE, [plan], []);
  assert.deepEqual(lag.dager[3], [{ planId: "p1", type: "REISE", tittel: "Testturnering", spiller: "Ola Testesen" }]);
  assert.equal(lag.dager[4][0].type, "TURNERING");
  assert.equal(lag.dager[5][0].type, "TURNERING");
  assert.equal(lag.dager[0].length, 0);
});

test("reisevarsel lister spillerens økter på reisedagen, ikke andres", () => {
  const lag = byggTurneringslag(UKE, [plan], [
    { spillerId: "s1", dato: "2026-10-01", tittel: "Styrke B" },
    { spillerId: "s2", dato: "2026-10-01", tittel: "Annen spiller" },
    { spillerId: "s1", dato: "2026-09-30", tittel: "Dagen før" },
  ]);
  assert.equal(lag.varsler.length, 1);
  assert.deepEqual(lag.varsler[0], { planId: "p1", dato: "2026-10-01", spiller: "Ola Testesen", spillerId: "s1", turnering: "Testturnering", okter: ["Styrke B"] });
});

test("uten reisedager blir det ingen varsel og ingen avstandsgjetning", () => {
  const lag = byggTurneringslag(UKE, [{ ...plan, reiseFra: null, reiseTil: null }], []);
  assert.equal(lag.varsler.length, 0);
  assert.equal(lag.dager[3].length, 0);
});

test("reise samme dag som første runde gir både turneringscelle og varsel", () => {
  const lag = byggTurneringslag(UKE, [{ ...plan, reiseFra: "2026-10-02", reiseTil: "2026-10-02" }], []);
  assert.equal(lag.dager[4][0].type, "TURNERING");
  assert.equal(lag.varsler.length, 1);
  assert.equal(lag.varsler[0].dato, "2026-10-02");
});
