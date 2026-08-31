import test from "node:test";
import assert from "node:assert/strict";
import { nesteOktRadTekst, sisteAktivitetTekst, prikkFraSev } from "./stall-rad-tekst";

// Fast referansepunkt: mandag 31.08.2026 kl. 09:00 UTC = 11:00 Oslo (sommertid).
const NAA = new Date("2026-08-31T09:00:00Z");

test("nesteOktRadTekst: ingen økt", () => {
  assert.equal(nesteOktRadTekst(null, NAA), "Ingen økt planlagt");
});

test("nesteOktRadTekst: i dag, senere samme Oslo-dag", () => {
  const okt = { startTime: new Date("2026-08-31T12:00:00Z") }; // 14.00 Oslo
  assert.equal(nesteOktRadTekst(okt, NAA), "Neste: i dag 14.00");
});

test("nesteOktRadTekst: i morgen", () => {
  const okt = { startTime: new Date("2026-09-01T05:30:00Z") }; // 07.30 Oslo
  assert.equal(nesteOktRadTekst(okt, NAA), "Neste: i morgen 07.30");
});

test("nesteOktRadTekst: senere denne uka viser ukedag", () => {
  const okt = { startTime: new Date("2026-09-03T14:00:00Z") }; // torsdag 16.00 Oslo
  const tekst = nesteOktRadTekst(okt, NAA);
  assert.match(tekst, /^Neste: tor 16\.00$/);
});

test("nesteOktRadTekst: mer enn 6 dager frem viser dato", () => {
  const okt = { startTime: new Date("2026-09-10T13:00:00Z") }; // 15.00 Oslo
  assert.equal(nesteOktRadTekst(okt, NAA), "Neste: 10.9 15.00");
});

test("nesteOktRadTekst: midnatts-vinduet ruller ikke bakover en dag (Oslo, ikke UTC)", () => {
  // 31.08 kl. 22:30 Oslo (sommertid, UTC+2) = 20:30 UTC — samme UTC-dag,
  // men skal fortsatt telle som «i dag» i Oslo-tid.
  const naaSent = new Date("2026-08-31T20:30:00Z");
  const okt = { startTime: new Date("2026-08-31T21:00:00Z") }; // 23.00 Oslo
  assert.equal(nesteOktRadTekst(okt, naaSent), "Neste: i dag 23.00");
});

test("sisteAktivitetTekst", () => {
  assert.equal(sisteAktivitetTekst(null), "aldri logget inn");
  assert.equal(sisteAktivitetTekst(0), "logget i dag");
  assert.equal(sisteAktivitetTekst(1), "logget i går");
  assert.equal(sisteAktivitetTekst(8), "8 dg siden");
});

test("prikkFraSev: fylt = trenger deg, åpen = følg med, ingen = på planen", () => {
  assert.equal(prikkFraSev("sterk"), "fylt");
  assert.equal(prikkFraSev("medium"), "fylt");
  assert.equal(prikkFraSev("lav"), "aapen");
  assert.equal(prikkFraSev("ok"), "ingen");
});
