/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/mulligan/ledige-tider.test.ts
 *
 * Tester kun regnUtLedigeVinduer() — den rene utregningsfunksjonen bak
 * finnLedigeTider() i scripts/mulligan-triage/kalender.ts. Selve
 * Google Calendar-kallet krever nettverk + en aktiv tilkobling og testes
 * derfor ikke her (samme grense som kalenderNavnMatcher/kalenderAgenda).
 *
 * Alle tider under er faste UTC-tidspunkter valgt for en dato i norsk
 * sommertid (juli, Oslo = UTC+2), slik at forventningene er eksplisitte og
 * ikke avhenger av maskinens lokale tidssone.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { regnUtLedigeVinduer } from "./ledige-tider";

// Mandag 2026-07-20 (Oslo, UTC+2): 00:00 lokal = 2026-07-19T22:00Z, 24:00 lokal = 2026-07-20T22:00Z.
const DAG1_APNER = new Date("2026-07-20T08:00:00Z"); // 10:00 Oslo
const DAG1_STENGER = new Date("2026-07-20T19:00:00Z"); // 21:00 Oslo
// Innenfor Oslo-dagen 2026-07-20 (02:00–23:00 lokal), men utenfor selve åpningsvinduet.
const DAG1_FRA = new Date("2026-07-20T00:00:00Z");
const DAG1_TIL = new Date("2026-07-20T21:00:00Z");

test("hele dagen ledig når ingen travle perioder er oppgitt", () => {
  const resultat = regnUtLedigeVinduer([], DAG1_FRA, DAG1_TIL, 10, 21);
  assert.deepEqual(resultat, [{ start: DAG1_APNER, slutt: DAG1_STENGER }]);
});

test("hele dagen opptatt gir ingen ledige vinduer", () => {
  const travlePerioder = [
    { start: new Date("2026-07-20T07:00:00Z"), slutt: new Date("2026-07-20T20:00:00Z") },
  ];
  const resultat = regnUtLedigeVinduer(travlePerioder, DAG1_FRA, DAG1_TIL, 10, 21);
  assert.deepEqual(resultat, []);
});

test("overlappende travle perioder slås sammen og gir riktige gap", () => {
  const travlePerioder = [
    { start: new Date("2026-07-20T09:00:00Z"), slutt: new Date("2026-07-20T10:00:00Z") },
    { start: new Date("2026-07-20T09:30:00Z"), slutt: new Date("2026-07-20T11:00:00Z") }, // overlapper forrige
    { start: new Date("2026-07-20T15:00:00Z"), slutt: new Date("2026-07-20T16:00:00Z") },
  ];
  const resultat = regnUtLedigeVinduer(travlePerioder, DAG1_FRA, DAG1_TIL, 10, 21);
  assert.deepEqual(resultat, [
    { start: DAG1_APNER, slutt: new Date("2026-07-20T09:00:00Z") },
    { start: new Date("2026-07-20T11:00:00Z"), slutt: new Date("2026-07-20T15:00:00Z") },
    { start: new Date("2026-07-20T16:00:00Z"), slutt: DAG1_STENGER },
  ]);
});

test("tilstøtende travle perioder (slutt = start) slås også sammen", () => {
  const travlePerioder = [
    { start: new Date("2026-07-20T09:00:00Z"), slutt: new Date("2026-07-20T10:00:00Z") },
    { start: new Date("2026-07-20T10:00:00Z"), slutt: new Date("2026-07-20T11:00:00Z") }, // starter idet forrige slutter
  ];
  const resultat = regnUtLedigeVinduer(travlePerioder, DAG1_FRA, DAG1_TIL, 10, 21);
  assert.deepEqual(resultat, [
    { start: DAG1_APNER, slutt: new Date("2026-07-20T09:00:00Z") },
    { start: new Date("2026-07-20T11:00:00Z"), slutt: DAG1_STENGER },
  ]);
});

test("travel periode som stikker utenfor åpningstiden klippes til vinduet", () => {
  const travlePerioder = [
    { start: new Date("2026-07-20T05:00:00Z"), slutt: new Date("2026-07-20T09:00:00Z") }, // starter før åpning
    { start: new Date("2026-07-20T18:00:00Z"), slutt: new Date("2026-07-20T23:00:00Z") }, // slutter etter stenging
  ];
  const resultat = regnUtLedigeVinduer(travlePerioder, DAG1_FRA, DAG1_TIL, 10, 21);
  assert.deepEqual(resultat, [
    { start: new Date("2026-07-20T09:00:00Z"), slutt: new Date("2026-07-20T18:00:00Z") },
  ]);
});

test("flere dager i intervallet gir ett vindu per dag", () => {
  const fraDato = new Date("2026-07-20T00:00:00Z");
  const tilDato = new Date("2026-07-21T21:00:00Z"); // spenner mandag + tirsdag (Oslo)
  const resultat = regnUtLedigeVinduer([], fraDato, tilDato, 10, 21);
  assert.deepEqual(resultat, [
    { start: new Date("2026-07-20T08:00:00Z"), slutt: new Date("2026-07-20T19:00:00Z") },
    { start: new Date("2026-07-21T08:00:00Z"), slutt: new Date("2026-07-21T19:00:00Z") },
  ]);
});

test("travel periode helt utenfor åpningstiden påvirker ikke resultatet", () => {
  const travlePerioder = [
    { start: new Date("2026-07-20T02:00:00Z"), slutt: new Date("2026-07-20T04:00:00Z") }, // natt, før åpning
  ];
  const resultat = regnUtLedigeVinduer(travlePerioder, DAG1_FRA, DAG1_TIL, 10, 21);
  assert.deepEqual(resultat, [{ start: DAG1_APNER, slutt: DAG1_STENGER }]);
});

test("tilDato før eller lik fraDato gir tomt resultat", () => {
  assert.deepEqual(regnUtLedigeVinduer([], DAG1_TIL, DAG1_FRA, 10, 21), []);
  assert.deepEqual(regnUtLedigeVinduer([], DAG1_FRA, DAG1_FRA, 10, 21), []);
});

test("ugyldig åpningstid (slutt <= start) gir tomt resultat", () => {
  assert.deepEqual(regnUtLedigeVinduer([], DAG1_FRA, DAG1_TIL, 15, 15), []);
  assert.deepEqual(regnUtLedigeVinduer([], DAG1_FRA, DAG1_TIL, 15, 10), []);
});

test("bruker default-åpningstid (10–21) når parametrene utelates", () => {
  const resultat = regnUtLedigeVinduer([], DAG1_FRA, DAG1_TIL);
  assert.deepEqual(resultat, [{ start: DAG1_APNER, slutt: DAG1_STENGER }]);
});
