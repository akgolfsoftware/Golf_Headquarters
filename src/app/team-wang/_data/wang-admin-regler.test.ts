import assert from "node:assert/strict";
import { test } from "node:test";

import {
  byggTrenerRader,
  filtrerTrenere,
  initialer,
  lesTrinn,
  lesUkeParam,
  passerSamtykkeFilter,
  skolearFor,
  skolearKort,
  telBesatte,
  vurderSamtykke,
} from "./wang-admin-regler";

const G = "wang-gruppe";
const rad = (scope: string, gitt: boolean, rolle: "SELV" | "FORESATT", iso: string, gruppe = G) => ({
  scope,
  mottakerGruppeId: gruppe,
  gitt,
  gittAvRolle: rolle,
  createdAt: new Date(iso),
});

test("WANG-19: hovedcoach er Sportssjef, andre er Trener, ASSISTANT er innsyn", () => {
  const rader = byggTrenerRader(
    [
      { userId: "b", navn: "Bent Berg", epost: "b@wang.no", gruppeRolle: "COACH", joinedAt: new Date("2026-08-01T10:00:00Z"), endedAt: null },
      { userId: "a", navn: "Anders Kristiansen", epost: "a@wang.no", gruppeRolle: "COACH", joinedAt: new Date("2026-08-01T10:00:00Z"), endedAt: null },
      { userId: "c", navn: "Cecilie Dahl", epost: "c@wang.no", gruppeRolle: "ASSISTANT", joinedAt: new Date("2025-08-01T10:00:00Z"), endedAt: new Date("2026-06-20T10:00:00Z") },
    ],
    "a",
  );
  assert.deepEqual(rader.map((r) => [r.userId, r.rolle, r.aktiv, r.bareInnsyn]), [
    ["a", "Sportssjef", true, false],
    ["b", "Trener", true, false],
    ["c", "Trener", false, true],
  ]);
  assert.equal(rader[2].til, "20.06.2026");
  assert.equal(filtrerTrenere(rader, "aktive").length, 2);
  assert.equal(filtrerTrenere(rader, "avsluttet").length, 1);
});

test("WANG-19: initialer", () => {
  assert.equal(initialer("Anders Kristiansen"), "AK");
  assert.equal(initialer("Mia"), "M");
  assert.equal(initialer("  "), "·");
});

test("WANG-34: ingen rader er ikke delt", () => {
  assert.equal(vurderSamtykke([], G, false).status, "ikke");
});

test("WANG-34: voksen som har delt testresultater er delt", () => {
  const v = vurderSamtykke([rad("TEST_RESULTATER", true, "SELV", "2026-09-02T10:00:00Z")], G, false);
  assert.equal(v.status, "delt");
  assert.match(v.detalj, /02\.09\.2026/);
  assert.match(v.detalj, /testresultater/);
});

test("WANG-34: samtykke mot en annen gruppe teller ikke", () => {
  assert.equal(vurderSamtykke([rad("STATS", true, "SELV", "2026-09-02T10:00:00Z", "annen")], G, false).status, "ikke");
});

test("WANG-34: nyeste rad vinner — trukket deling er ikke delt", () => {
  const v = vurderSamtykke(
    [rad("STATS", true, "SELV", "2026-09-01T10:00:00Z"), rad("STATS", false, "SELV", "2026-09-10T10:00:00Z")],
    G,
    false,
  );
  assert.equal(v.status, "trukket");
  assert.match(v.detalj, /10\.09\.2026/);
  assert.equal(passerSamtykkeFilter(v.status, "ikke"), true);
});

test("WANG-34: under 16 teller bare foresatt", () => {
  const selv = [rad("STATS", true, "SELV", "2026-09-01T10:00:00Z")];
  assert.equal(vurderSamtykke(selv, G, true).status, "venter");
  const medForesatt = [...selv, rad("STATS", true, "FORESATT", "2026-09-03T10:00:00Z")];
  const v = vurderSamtykke(medForesatt, G, true);
  assert.equal(v.status, "delt");
  assert.match(v.detalj, /forelder godkjente/);
});

test("WANG-26: trinn og uke leses trygt fra adressen", () => {
  assert.equal(lesTrinn("VG2"), "VG2");
  assert.equal(lesTrinn("VG9"), "alle");
  assert.equal(lesTrinn(["VG1"]), "alle");
  assert.deepEqual(lesUkeParam("2026-09-28"), { aar: 2026, maned: 9, dag: 28 });
  assert.equal(lesUkeParam("2026-02-30"), null);
  assert.equal(lesUkeParam("i-morgen"), null);
});

test("Skoleår starter 1. august", () => {
  assert.equal(skolearFor(2026, 9), "2026/2027");
  assert.equal(skolearFor(2027, 3), "2026/2027");
  assert.equal(skolearKort(new Date("2026-09-29T10:00:00Z")), "2026/27");
  assert.equal(skolearKort(new Date("2027-07-31T10:00:00Z")), "2026/27");
});

test("WANG-32: besatte plasser telles per trinn", () => {
  const b = telBesatte(["VG1", "VG1", "VG3", null, "VG7"]);
  assert.deepEqual(b.perTrinn, { VG1: 2, VG2: 0, VG3: 1 });
  assert.equal(b.utenTrinn, 2);
  assert.equal(b.totalt, 5);
});
