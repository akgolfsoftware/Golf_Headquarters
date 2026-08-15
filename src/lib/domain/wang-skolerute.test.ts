import { test } from "node:test";
import assert from "node:assert/strict";

import { grupperSkoleDager, hengerSammen, skoleType } from "./wang-skolerute";

// Hjelper: bygg dagsliste fra ISO-datoer med samme tittel.
function dager(tittel: string, ...datoer: string[]) {
  return datoer.map((dato) => ({ dato, tittel }));
}

test("hengerSammen: rett etter hverandre", () => {
  assert.equal(hengerSammen("2026-09-28", "2026-09-29"), true);
});

test("hengerSammen: hopper over helg (fredag → mandag)", () => {
  // 25. des 2026 er fredag, 28. des er mandag.
  assert.equal(hengerSammen("2026-12-25", "2026-12-28"), true);
});

test("hengerSammen: hopper over lørdag (fredag → søndag)", () => {
  assert.equal(hengerSammen("2026-12-25", "2026-12-27"), true);
});

test("hengerSammen: én hel uke er IKKE sammenhengende", () => {
  assert.equal(hengerSammen("2026-12-25", "2027-01-04"), false);
});

test("hengerSammen: hull midt i uka er IKKE sammenhengende", () => {
  // 2026-09-29 er tirsdag, 2026-10-01 er torsdag — onsdag mangler.
  assert.equal(hengerSammen("2026-09-29", "2026-10-01"), false);
});

test("juleferien blir ÉN rad, ikke to (helgen 26.–27. des mangler i basen)", () => {
  const jul = grupperSkoleDager(
    dager(
      "Juleferie",
      "2026-12-21",
      "2026-12-22",
      "2026-12-23",
      "2026-12-24",
      "2026-12-25",
      // 26.–27. des er lørdag/søndag og finnes ikke i skoleruta
      "2026-12-28",
      "2026-12-29",
      "2026-12-30",
      "2026-12-31",
      "2027-01-01",
    ),
  );

  assert.equal(jul.length, 1, "juleferien skal være én sammenhengende rad");
  assert.equal(jul[0].startIso, "2026-12-21");
  assert.equal(jul[0].sluttIso, "2027-01-01");
  assert.equal(jul[0].type, "Ferie");
});

test("ulike titler slås aldri sammen", () => {
  const blandet = grupperSkoleDager([
    { dato: "2026-11-19", tittel: "Planleggingsdag (elevfri)" },
    { dato: "2026-11-20", tittel: "Høstferie" },
  ]);
  assert.equal(blandet.length, 2);
});

test("to adskilte ferier med samme tittel forblir adskilt", () => {
  const to = grupperSkoleDager(
    dager("Ferie", "2026-10-01", "2026-10-02", "2026-11-16", "2026-11-17"),
  );
  assert.equal(to.length, 2);
  assert.equal(to[0].sluttIso, "2026-10-02");
  assert.equal(to[1].startIso, "2026-11-16");
});

test("skoleType kjenner igjen de fem typene", () => {
  assert.equal(skoleType("Skolestart"), "Oppstart");
  assert.equal(skoleType("Siste skoledag"), "Avslutning");
  assert.equal(skoleType("Planleggingsdag (elevfri)"), "Elevfri");
  assert.equal(skoleType("Høstferie (uke 40)"), "Ferie");
  assert.equal(skoleType("Kristi himmelfartsdag"), "Fridag");
});
